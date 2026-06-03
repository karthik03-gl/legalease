import React, { useState } from 'react';
import { StatusBar } from '../components/Layout';
import './Login.css';
import { loginUserWithOTP } from '../firebase/auth';

export default function LoginScreen({ onLoginOTP, onGoRegister, onGoForgot }) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim())    { setError('Please enter your email address.'); return; }
    if (!password)        { setError('Please enter your password.'); return; }
    setLoading(true); setError('');
    try {
      // Validate credentials → send OTP → navigate to OTP screen
      const otpResult = await loginUserWithOTP({ email: email.trim(), password });
      onLoginOTP(otpResult);
    } catch (e) {
      const code = e.code || e.message || '';
      if (code === 'NO_ACCOUNT')              setError('No account found. Please register first.');
      else if (code.includes('wrong-password') || code.includes('invalid-credential')) setError('Incorrect password. Please try again.');
      else if (code.includes('user-not-found'))  setError('No account with this email. Please register first.');
      else if (code.includes('invalid-email'))   setError('Invalid email address.');
      else if (code.includes('too-many-requests')) setError('Too many attempts. Please wait a moment.');
      else setError('Login failed. Please check your details and try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="screen login-screen">
      <div className="login-header">
        <StatusBar theme="blue" />
        <div className="login-logo-area">
          <div className="logo-ring">
            <div className="logo-box">
              <div className="logo-line" style={{ width:'100%' }} />
              <div className="logo-line" style={{ width:'75%' }} />
              <div className="logo-line" style={{ width:'55%' }} />
            </div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div className="login-app-name">LegalEase</div>
            <div className="login-tagline">Understand legal documents in plain language</div>
          </div>
          <span className="badge badge-green">AI Powered</span>
        </div>
      </div>

      <div className="scroll-body login-body">
        <div className="login-card">
          <div className="form-welcome">Welcome back</div>
          <div className="form-sub">Sign in to your account</div>

          {error && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#DC2626', display:'flex', alignItems:'center', gap:8 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:5 }}>Email address</label>
            <input className="field-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
          </div>

          <div style={{ marginBottom:8 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:5 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input className="field-input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ paddingRight:44 }} />
              <button onClick={() => setShowPass(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ textAlign:'right', marginBottom:18 }}>
            <span 
              style={{ fontSize:12, color:'var(--blue)', fontWeight:600, cursor:'pointer' }}
              onClick={onGoForgot}
            >
              Forgot password?
            </span>
          </div>

          <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ opacity: loading ? 0.8 : 1 }}>
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                Sending OTP…
              </span>
            ) : 'Sign In →'}
          </button>

          {/* Info about OTP */}
          <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:10, padding:'10px 14px', marginTop:14, fontSize:11, color:'#1E40AF', textAlign:'center', lineHeight:1.6 }}>
            🔒 We'll send a verification code to your email for security.
          </div>

          <div className="divider" style={{ margin:'18px 0' }}>
            <div className="divider-line" /><span className="divider-text">or</span><div className="divider-line" />
          </div>

          <button className="google-btn" disabled style={{ opacity:0.6, cursor:'not-allowed' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google (coming soon)
          </button>
        </div>

        <div className="signup-row">
          Don't have an account? <span className="signup-link" onClick={onGoRegister}>Register free →</span>
        </div>
        <div className="terms-text">By signing in, you agree to our Terms & Privacy Policy</div>
      </div>
    </div>
  );
}
