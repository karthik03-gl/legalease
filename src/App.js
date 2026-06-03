import React, { useState, useCallback, useEffect } from 'react';
import './index.css';

// Auth
import { onAuthChange, logoutUser } from './firebase/auth';

// Screens
import OnboardingScreen from './screens/Onboarding';
import LoginScreen      from './screens/Login';
import RegisterScreen   from './screens/Register';
import OTPVerifyScreen  from './screens/OTPVerify';
import ForgotScreen     from './screens/Forgot';
import HomeScreen       from './screens/Home';
import UploadScreen     from './screens/Upload';
import ProcessingScreen from './screens/Processing';
import ResultsScreen    from './screens/Results';
import DocumentsScreen  from './screens/Documents';
import AskAIScreen      from './screens/AskAI';
import SettingsScreen   from './screens/Settings';

const ALL_SCREENS = [
  'onboarding','login','register','otp',
  'home','upload','processing','results',
  'documents','askai','settings'
];

export default function App() {
  const [screen, setScreen]         = useState('onboarding');
  const [direction, setDirection]   = useState('forward');
  const [uploadData, setUploadData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [authUser, setAuthUser]     = useState(null);
  const [userData, setUserData]     = useState(null);
  const [otpData, setOtpData]       = useState(null);   // { email, otp, name, user, password?, mode }
  const [authChecked, setAuthChecked] = useState(false);
  const [otpPending, setOtpPending]   = useState(false); // prevents auto-login during OTP

  // ── Global theme initialization ──────────────
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // ── Listen for Firebase auth state changes ──────────────
  useEffect(() => {
    const unsub = onAuthChange(user => {
      setAuthUser(user);
      setAuthChecked(true);
      // If already logged in and on auth screens → go home
      // BUT NOT if OTP verification is pending (login OTP flow)
      if (user && !otpPending && ['onboarding','login','register'].includes(screen)) {
        setScreen('home');
      }
    });
    return unsub;
  }, [otpPending]); // eslint-disable-line

  const go = useCallback((next, dir = 'forward') => {
    setDirection(dir);
    setScreen(next);
  }, []);

  const goBack = useCallback((next) => go(next, 'back'), [go]);

  const handleNav = useCallback((id) => {
    const map = { home:'home', docs:'documents', ai:'askai', settings:'settings' };
    go(map[id] || id);
  }, [go]);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setAuthUser(null);
    setUserData(null);
    setOtpPending(false);
    go('login', 'back');
  }, [go]);

  // Show loading spinner while Firebase checks auth
  if (!authChecked) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:16 }}>
        <div className="phone-shell" style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'#F8FAFC' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:18, background:'#2563EB', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:28 }}>⚖️</span>
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'#0F172A' }}>LegalEase</div>
            <div style={{ marginTop:20 }}>
              <div style={{ width:40, height:40, border:'3px solid #DBEAFE', borderTopColor:'#2563EB', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Screen definitions ────────────────────────────────────
  const screens = {

    onboarding: (
      <OnboardingScreen onDone={() => go('login')} />
    ),

    login: (
      <LoginScreen
        onLoginOTP={(data) => {
          // Login credentials valid → OTP sent → go to OTP screen
          setOtpPending(true);
          setOtpData({ ...data, mode: 'login' });
          go('otp');
        }}
        onGoRegister={() => go('register')}
        onGoForgot={() => go('forgot')}
      />
    ),

    forgot: (
      <ForgotScreen onGoLogin={() => goBack('login')} />
    ),

    register: (
      <RegisterScreen
        onRegistered={(data) => {
          setOtpPending(true);
          setOtpData({ ...data, mode: 'register' });
          go('otp');
        }}
        onGoLogin={() => goBack('login')}
      />
    ),

    otp: (
      <OTPVerifyScreen
        email={otpData?.email}
        name={otpData?.name}
        otp={otpData?.otp}
        user={otpData?.user}
        password={otpData?.password}
        mode={otpData?.mode || 'register'}
        onVerified={(user, ud) => {
          setOtpPending(false);
          setAuthUser(user);
          if (ud) setUserData(ud);
          go('home');
        }}
        onBack={() => {
          setOtpPending(false);
          goBack(otpData?.mode === 'login' ? 'login' : 'register');
        }}
      />
    ),

    home: (
      <HomeScreen
        user={authUser}
        userData={userData}
        onUpload={() => { setUploadData(null); go('upload'); }}
        onScanPhoto={(file) => { setUploadData({ initialFile: file }); go('upload'); }}
        onDoc={() => { setUploadData(null); go('processing'); }}
        onNav={handleNav}
      />
    ),

    upload: (
      <UploadScreen
        initialFile={uploadData?.initialFile}
        onBack={() => goBack('home')}
        onAnalyse={(data) => { setUploadData(data); go('processing'); }}
      />
    ),

    processing: (
      <ProcessingScreen
        uploadData={uploadData}
        user={authUser}
        onDone={(result) => { setResultData(result); go('results'); }}
      />
    ),

    results: (
      <ResultsScreen
        result={resultData}
        user={authUser}
        onBack={() => goBack('home')}
        onNav={handleNav}
      />
    ),

    documents: (
      <DocumentsScreen
        user={authUser}
        onDoc={() => { setUploadData(null); go('processing'); }}
        onUpload={() => { setUploadData(null); go('upload'); }}
        onNav={handleNav}
      />
    ),

    askai: <AskAIScreen onNav={handleNav} />,

    settings: (
      <SettingsScreen
        user={authUser}
        userData={userData}
        onNav={handleNav}
        onLogout={handleLogout}
      />
    ),
  };

  const animClass = direction === 'back' ? 'screen-enter-back' : 'screen-enter';

  return (
    <>
      <div className="phone-shell">
        <div key={screen} className={`screen ${animClass}`}>
          {screens[screen]}
        </div>
      </div>
    </>
  );
}
