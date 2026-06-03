# LegalEase — Complete Setup Guide
# Firebase Auth + OTP Email + Gemini AI

This guide sets up everything from scratch.
Total time: ~30 minutes. All services are FREE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — INSTALL NODE.JS (if not installed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://nodejs.org
2. Download LTS version → Install it
3. Verify in terminal:
     node --version    (should show v18 or v20)
     npm --version

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — SET UP FIREBASE (Free Database + Auth)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Firebase stores user accounts and documents. 100% free.

2a. Create Firebase Project:
  → Go to: https://console.firebase.google.com
  → Click "Create a project"
  → Name it: LegalEase
  → Disable Google Analytics (optional)
  → Click "Create project"

2b. Add Web App:
  → In your project, click "</>" (Web icon)
  → App nickname: LegalEase Web
  → Click "Register app"
  → COPY the firebaseConfig object — you'll need it!
     It looks like:
       apiKey: "AIzaSyXXXXXXXXX",
       authDomain: "legalease-XXXXX.firebaseapp.com",
       projectId: "legalease-XXXXX",
       ...

2c. Enable Email/Password Authentication:
  → In Firebase Console → Build → Authentication
  → Click "Get started"
  → Sign-in methods tab → Email/Password → Enable → Save

2d. Create Firestore Database:
  → Build → Firestore Database → Create database
  → Choose "Start in test mode" (for development)
  → Select a location closest to India (e.g. asia-south1)
  → Click "Done"

2e. Set Firestore Security Rules (important!):
  → Firestore → Rules tab → Replace with:

    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
          match /documents/{docId} {
            allow read, write: if request.auth != null && request.auth.uid == userId;
          }
        }
      }
    }

  → Click "Publish"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — SET UP EMAILJS (Free OTP Emails)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EmailJS sends the OTP verification emails. Free: 200/month.

3a. Create EmailJS Account:
  → Go to: https://www.emailjs.com
  → Click "Sign Up" → Create account

3b. Add Email Service:
  → Dashboard → Email Services → Add New Service
  → Choose "Gmail" (easiest)
  → Connect your Gmail account
  → Note the SERVICE ID (looks like: service_xxxxxxx)

3c. Create Email Template:
  → Email Templates → Create New Template
  → Set Subject: Your LegalEase verification code: {{otp_code}}
  → Set Body:
      Hello {{to_name}},

      Your LegalEase verification code is:

      {{otp_code}}

      This code expires in 10 minutes.
      Do not share this code with anyone.

      — LegalEase Team

  → Save the template
  → Note the TEMPLATE ID (looks like: template_xxxxxxx)

3d. Get your Public Key:
  → Account → General → Public Key
  → Note it (looks like: XXXXXXXXXXXXXXXXXXXXX)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — GET GEMINI AI KEY (Free)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  → Go to: https://aistudio.google.com/apikey
  → Sign in with Google
  → Click "Create API Key"
  → Copy the key (starts with AIzaSy)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — CREATE .env.local FILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In your legalease/ folder, create a file called: .env.local
Add all your keys (replace with YOUR actual values):

  REACT_APP_GEMINI_API_KEY=AIzaSyYour-Gemini-Key

  REACT_APP_FIREBASE_API_KEY=AIzaSyYour-Firebase-Key
  REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  REACT_APP_FIREBASE_PROJECT_ID=your-project-id
  REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
  REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

  REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxx
  REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxx
  REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — INSTALL & RUN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open VS Code → Open legalease/ folder → Open Terminal (Ctrl+backtick)

  npm install          (installs all packages including Firebase)

  Terminal 1:
  node server.js       (starts Gemini proxy)

  Terminal 2:
  npm start            (starts React app)

  OR run both:
  npm run dev

Opens at: http://localhost:3000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — TEST THE FULL FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. App opens → Onboarding slides
2. Login screen → Click "Register free"
3. Fill name, email, password → Submit
4. Check your email for OTP code
5. Enter 6-digit OTP → Verified!
6. You're logged in → Home screen
7. Upload a document → AI analyses it
8. Results in English / हिंदी / ಕನ್ನಡ
9. Ask questions → AI answers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICES SUMMARY (all FREE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Service         Purpose                Free Limit
─────────────────────────────────────────────────
Firebase Auth   User login/register    Unlimited users
Firestore DB    Store user data        1GB storage
Google Gemini   AI document analysis   15 req/min
EmailJS         Send OTP emails        200 emails/month

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE STRUCTURE (Firestore)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

users/
  {uid}/                    ← user profile
    name: "Karthik G L"
    email: "karthik@..."
    emailVerified: true
    preferredLang: "en"
    docsAnalysed: 5
    plan: "free"
    createdAt: timestamp
    documents/
      {docId}/              ← each analysed document
        docTitle: "Rental Agreement"
        summary: "..."
        important: "..."
        meaning: "..."
        lang: "hi"
        createdAt: timestamp
