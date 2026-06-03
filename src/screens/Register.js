import React, { useState } from 'react';
import { StatusBar } from '../components/Layout';
import Icon from '../components/Icon';
import { registerUser, generateOTP, sendOTPEmail } from '../firebase/auth';
import './Register.css';

function validate(name, email, password, confirm) {
  const errs = {};
  if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email address';
  if (password.length < 6) errs.password = 'Password must be at least 6 characters';
  if (password !== confirm) errs.confirm = 'Passwords do not match';
  return errs;
}

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#2563EB'];
const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];

export default function RegisterScreen({ onRegistered, onGoLogin }) {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const strength = passwordStrength(form.password);
  const update = (k, v) => { setForm(f => ({...f, [k]:v})); setErrors(e => ({...e, [k]:''})); setApiError(''); };

  const handleRegister = async () => {
    const errs = validate(form.name, form.email, form.password, form.confirm);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      // 1. Generate and send OTP BEFORE creating account
      const otp = generateOTP();
      await sendOTPEmail(form.email.trim(), otp, form.name.trim());
      
      // 2. Pass data to parent to show OTP screen
      onRegistered({ 
        email: form.email.trim(), 
        password: form.password,
        name: form.name.trim(),
        otp: otp 
      });
    } catch (e) {
      setApiError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen register-screen">
      {/* Header */}
      <div className="register-header">
        <StatusBar theme="blue" />
        <div className="register-header-top">
          <div>
            <div className="register-title">Create Account</div>
            <div className="register-sub">Join LegalEase — it's free</div>
          </div>
          <div style={{ width:48, height:48, borderRadius:16, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="doc" size={24} color="white" />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="scroll-body register-body">
        <div className="register-card">

          {/* API Error */}
          {apiError && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, color:'#DC2626', display:'flex', alignItems:'center', gap:8 }}>
              <span>⚠️</span>{apiError}
            </div>
          )}

          {/* Full Name */}
          <div className="form-row">
            <label className="form-label">Full name</label>
            <input className={`form-input${errors.name ? ' error' : ''}`} placeholder="Karthik G L"
              value={form.name} onChange={e => update('name', e.target.value)} />
            {errors.name && <div className="form-error">⚠ {errors.name}</div>}
          </div>

          {/* Email */}
          <div className="form-row">
            <label className="form-label">Email address</label>
            <input className={`form-input${errors.email ? ' error' : ''}`} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => update('email', e.target.value)} />
            {errors.email && <div className="form-error">⚠ {errors.email}</div>}
          </div>

          {/* Password */}
          <div className="form-row">
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <input className={`form-input${errors.password ? ' error' : ''}`}
                type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                value={form.password} onChange={e => update('password', e.target.value)}
                style={{ paddingRight:44 }} />
              <button onClick={() => setShowPass(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-mid)', fontSize:16 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <>
                <div className="strength-bar" style={{ width:`${(strength/4)*100}%`, background: STRENGTH_COLORS[strength-1] || '#E2E8F0' }} />
                <div style={{ fontSize:10, color: STRENGTH_COLORS[strength-1] || 'var(--text-light)', marginTop:3, fontWeight:600 }}>
                  {form.password ? `Password strength: ${STRENGTH_LABELS[strength-1] || 'Very Weak'}` : ''}
                </div>
              </>
            )}
            {errors.password && <div className="form-error">⚠ {errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div className="form-row">
            <label className="form-label">Confirm password</label>
            <input className={`form-input${errors.confirm ? ' error' : ''}`}
              type="password" placeholder="Re-enter password"
              value={form.confirm} onChange={e => update('confirm', e.target.value)} />
            {errors.confirm && <div className="form-error">⚠ {errors.confirm}</div>}
          </div>

          {/* Terms */}
          <div style={{ fontSize:11, color:'var(--text-light)', marginBottom:18, lineHeight:1.6 }}>
            By registering, you agree to our <span style={{ color:'var(--blue)', cursor:'pointer' }}>Terms of Service</span> and <span style={{ color:'var(--blue)', cursor:'pointer' }}>Privacy Policy</span>.
          </div>

          {/* Submit */}
          <button className="btn btn-primary" onClick={handleRegister} disabled={loading}
            style={{ opacity: loading ? 0.8 : 1 }}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </div>

        <div className="login-link">
          Already have an account? <span onClick={onGoLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}
