import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StatusBar, TopBar } from '../components/Layout';
import { markEmailVerified, generateOTP, sendOTPEmail, reAuthenticateUser, registerUser } from '../firebase/auth';
import './OTPVerify.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function OTPVerifyScreen({ email, name, otp: initialOtp, user, password, mode = 'register', onVerified, onBack }) {
  const [digits, setDigits]   = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer]     = useState(RESEND_COOLDOWN);
  const [currentOtp, setCurrentOtp] = useState(initialOtp);
  const [attempts, setAttempts]     = useState(0);
  const inputRefs = useRef([]);

  const isLogin = mode === 'login';

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // Auto-focus first input
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleDigit = (idx, val) => {
    if (!/^\d*$/.test(val)) return; // numbers only
    const newDigits = [...digits];
    newDigits[idx] = val.slice(-1); // take last character
    setDigits(newDigits);
    setError('');

    // Move to next input
    if (val && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto-verify when all filled
    if (val && newDigits.every(d => d !== '') && newDigits.filter(d => d).length === OTP_LENGTH) {
      verify(newDigits.join(''));
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && idx > 0)              inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  // Handle paste of full OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      const arr = pasted.split('');
      setDigits(arr);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      verify(pasted);
    }
  };

  const verify = useCallback(async (code = digits.join('')) => {
    if (code.length !== OTP_LENGTH) { setError('Please enter all 6 digits.'); return; }
    if (attempts >= 5) { setError('Too many attempts. Please request a new OTP.'); return; }

    setLoading(true);
    setError('');

    // Simulate small delay for UX
    await new Promise(r => setTimeout(r, 600));

    if (code === currentOtp) {
      try {
        if (isLogin) {
          // LOGIN MODE: Re-authenticate user with stored credentials
          const { user: reAuthUser, userData } = await reAuthenticateUser({ email, password });
          await markEmailVerified(reAuthUser.uid);
          setSuccess(true);
          setTimeout(() => onVerified(reAuthUser, userData), 1000);
        } else {
          // REGISTER MODE: Create the Firebase account NOW since OTP is verified
          const newUser = await registerUser({ name, email, password });
          await markEmailVerified(newUser.uid);
          setSuccess(true);
          setTimeout(() => onVerified(newUser), 1000);
        }
      } catch (e) {
        console.error('OTP verification error:', e);
        const code = e.code || e.message || '';
        if (code.includes('email-already-in-use')) setError('Email already registered.');
        else setError('Verification failed. Please try again.');
      }
    } else {
      setAttempts(a => a + 1);
      setError(`Incorrect OTP. ${4 - attempts} attempts remaining.`);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  }, [digits, currentOtp, attempts, user, name, email, password, isLogin, onVerified]);

  const resendOTP = async () => {
    if (timer > 0) return;
    const newOtp = generateOTP();
    try {
      await sendOTPEmail(email, newOtp, name);
      setCurrentOtp(newOtp);
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      setAttempts(0);
      setTimer(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="screen otp-screen">
      <div className="otp-header">
        <StatusBar theme="blue" />
        <TopBar title="" onBack={onBack} dark
          right={<div style={{ width:1 }} />}
        />
        <div style={{ padding:'8px 0 0' }}>
          <div className="otp-icon-wrap">
            <span style={{ fontSize:32 }}>{isLogin ? '🔐' : '📧'}</span>
          </div>
          <div className="otp-header-title">
            {isLogin ? 'Login Verification' : 'Verify your email'}
          </div>
          <div className="otp-header-sub">
            We sent a 6-digit code to{'\n'}
            <strong style={{ color:'white' }}>{email}</strong>
          </div>
        </div>
      </div>

      <div className="scroll-body otp-body">
        <div className="otp-card">

          {/* Mode indicator */}
          <div style={{
            background: isLogin ? '#EFF6FF' : '#F0FDF4',
            border: `1px solid ${isLogin ? '#BFDBFE' : '#BBF7D0'}`,
            borderRadius: 10,
            padding: '8px 14px',
            marginBottom: 16,
            fontSize: 11,
            color: isLogin ? '#1E40AF' : '#166534',
            textAlign: 'center',
            fontWeight: 600,
          }}>
            {isLogin
              ? '🔒 Login verification — confirm your identity'
              : '✉️ Registration — verify your email address'}
          </div>

          {/* Success state */}
          {success ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'#065F46' }}>
                {isLogin ? 'Identity verified!' : 'Email verified!'}
              </div>
              <div style={{ fontSize:13, color:'var(--text-mid)', marginTop:6 }}>Taking you to your dashboard…</div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:600, color:'var(--text-dark)', textAlign:'center' }}>
                Enter 6-digit code
              </div>
              <div style={{ fontSize:12, color:'var(--text-mid)', textAlign:'center', marginTop:4 }}>
                Check your inbox and spam folder
              </div>

              {/* OTP Inputs */}
              <div className="otp-inputs" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    className={`otp-input${error ? ' error' : d ? ' filled' : ''}`}
                    type="text" inputMode="numeric" maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    disabled={loading || success}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#DC2626', textAlign:'center' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Verify button */}
              <button className="btn btn-primary" onClick={() => verify()} disabled={loading || digits.some(d => !d)}>
                {loading ? (
                  <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                    Verifying…
                  </span>
                ) : 'Verify OTP →'}
              </button>

              {/* Resend */}
              <div className="resend-row">
                Didn't receive it?
                {timer > 0
                  ? <span className="timer-badge">{`0:${timer.toString().padStart(2,'0')}`}</span>
                  : <button className="resend-btn" onClick={resendOTP}>Resend OTP</button>
                }
              </div>

              {/* Demo notice if no EmailJS */}
              {!process.env.REACT_APP_EMAILJS_SERVICE_ID && (
                <div style={{ background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:10, padding:'10px 14px', marginTop:12, fontSize:11, color:'#92400E', textAlign:'center', lineHeight:1.6 }}>
                  <strong>Demo mode:</strong> Check your browser console for the OTP code.<br/>
                  Set up EmailJS to send real emails.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
