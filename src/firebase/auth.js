// ── Firebase Auth Service ─────────────────────────────────
// Handles: Register, Login, OTP Email Verification, Logout
// Database: Firebase Firestore (stores user profiles)
// Auth:     Firebase Authentication (email/password)
// OTP:      Sent via EmailJS (free email service)

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';

// ── Generate 6-digit OTP ──────────────────────────────────
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Send OTP via EmailJS ──────────────────────────────────
// EmailJS is free: https://www.emailjs.com
// Free plan: 200 emails/month
export async function sendOTPEmail(email, otp, name) {
  const serviceId  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
  const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
  const publicKey  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS not configured. OTP:', otp);
    // In demo mode, show OTP in console
    return { success: true, demo: true };
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:  serviceId,
      template_id: templateId,
      user_id:     publicKey,
      template_params: {
        to_email: email,
        to_name:  name || email.split('@')[0],
        otp_code: otp,
        app_name: 'LegalEase',
      },
    }),
  });

  if (!response.ok) throw new Error('Failed to send OTP email');
  return { success: true };
}

// ── Register new user ─────────────────────────────────────
export async function registerUser({ name, email, password }) {
  // 1. Create Firebase auth account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Update display name
  await updateProfile(user, { displayName: name });

  // 3. Save user profile to Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid:         user.uid,
    name:        name,
    email:       email,
    createdAt:   serverTimestamp(),
    emailVerified: false,
    preferredLang: 'en',
    docsAnalysed:  0,
    plan:          'free',
  });

  return user;
}

// ── Login existing user ───────────────────────────────────
export async function loginUser({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Check if user exists in Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error('NO_ACCOUNT');
  }

  return { user, userData: userDoc.data() };
}

// ── Login with OTP verification ───────────────────────────
// Validates credentials, signs out, sends OTP, returns data for OTP screen
export async function loginUserWithOTP({ email, password }) {
  // 1. Validate credentials via Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Check if user exists in Firestore (must register first)
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error('NO_ACCOUNT');
  }

  const userData = userDoc.data();

  // 3. Check if email is verified — if not, require OTP
  // Sign out until OTP is verified
  await signOut(auth);

  // 4. Generate and send OTP
  const otp = generateOTP();
  const userName = userData.name || user.displayName || email.split('@')[0];
  await sendOTPEmail(email, otp, userName);

  // 5. Return data for OTP verification screen
  return {
    user,
    userData,
    otp,
    email,
    password, // needed to re-authenticate after OTP
    name: userName,
    mode: 'login',
  };
}

// ── Re-authenticate user after login OTP ──────────────────
export async function reAuthenticateUser({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  return { user, userData: userDoc.exists() ? userDoc.data() : null };
}

// ── Logout ────────────────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
}

// ── Get current user profile from Firestore ───────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ── Save verified OTP to Firestore ────────────────────────
export async function markEmailVerified(uid) {
  await setDoc(doc(db, 'users', uid), { emailVerified: true }, { merge: true });
}

// ── Auth state listener ───────────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Save document analysis to Firestore ───────────────────
export async function saveDocumentAnalysis(uid, data) {
  const { setDoc, doc: firestoreDoc, collection, serverTimestamp: ts } =
    await import('firebase/firestore');
  const docRef = firestoreDoc(db, 'users', uid, 'documents', Date.now().toString());
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    uid,
  });
}

// ── Get user documents from Firestore ───────────────────────
export async function getUserDocuments(uid) {
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
  const q = query(collection(db, 'users', uid, 'documents'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ── Update User Profile ────────────────────────────────────
export async function updateUserProfile(uid, name) {
  const user = auth.currentUser;
  if (user) {
    await updateProfile(user, { displayName: name });
  }
  await setDoc(doc(db, 'users', uid), { name }, { merge: true });
}

// ── Update User Preferences ────────────────────────────────
export async function updateUserPreferences(uid, prefs) {
  await setDoc(doc(db, 'users', uid), prefs, { merge: true });
}

// ── Password Reset ─────────────────────────────────────────
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
