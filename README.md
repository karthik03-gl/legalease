# LegalEase — AI Legal Document Simplifier
## Powered by Google Gemini 2.0 Flash (Free)

---

## 1. Get a FREE Gemini API Key

Go to: https://aistudio.google.com/apikey
Sign in with your Google account (no credit card needed)
Click "Create API Key" → Copy the key (starts with AIzaSy)

---

## 2. Add the key

Create a file called .env.local in the legalease/ folder:

  REACT_APP_GEMINI_API_KEY=AIzaSyYourActualKeyHere

No quotes. No spaces around =.

---

## 3. Run the app

Open VS Code → open the legalease/ folder → open Terminal (Ctrl + backtick)

First time only:
  npm install

Terminal 1 (proxy server):
  node server.js

You should see:
  ✅ LegalEase Proxy — Google Gemini AI
  🔑 API key: ✅ Found (AIzaSy...)

Terminal 2 (React app):
  npm start

Opens at: http://localhost:3000

OR run both at once:
  npm run dev

---

## 4. Verify everything works

Visit: http://localhost:3001/api/health
Should show: { "keyFound": true, "model": "gemini-2.0-flash" }

---

## Common errors

"Proxy server not running"
→ Run: node server.js in a terminal

"API key missing or invalid"
→ Check .env.local has:  REACT_APP_GEMINI_API_KEY=AIzaSy...
→ Key must start with AIzaSy
→ Restart: node server.js

"Rate limit"
→ Wait 60 seconds (free tier = 15 requests/minute)

After changing .env.local → always restart node server.js

---

## Project structure

legalease/
├── .env.local          ← YOUR KEY HERE (create this file)
├── .env.example        ← template
├── server.js           ← proxy server (run with: node server.js)
├── package.json
├── public/index.html
└── src/
    ├── App.js          ← screen router
    ├── index.css       ← global styles + design tokens
    ├── components/     ← Icon.js, Layout.js
    ├── screens/        ← 10 screens (Login, Home, Upload etc.)
    └── services/
        └── ai.js       ← Gemini API calls

