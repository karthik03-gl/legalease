import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';
import { getStorage }    from 'firebase/storage';

// Firebase config loaded from .env.local
// All values come from your Firebase console
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

let app, auth, db, storage;

try {
  app     = initializeApp(firebaseConfig);
  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.warn('Firebase not configured. Add Firebase keys to .env.local');
  // Return mock objects so app doesnt crash without Firebase
  auth    = { currentUser: null, onAuthStateChanged: (cb) => { cb(null); return () => {}; } };
  db      = {};
  storage = {};
}

export { auth, db, storage };
export default app;
