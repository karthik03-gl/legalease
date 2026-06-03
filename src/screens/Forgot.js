import React, { useState } from 'react';
import { StatusBar, TopBar } from '../components/Layout';
import { resetPassword } from '../firebase/auth';

export default function ForgotScreen({ onGoLogin }) {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      const code = err.code || '';
      if (code.includes('user-not-found')) {
        setError('No account found with this email.');
      } else if (code.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send reset link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen auth-screen">
      <StatusBar />
      
      <div className="auth-hero" style={{ height: 260 }}>
        <TopBar onBack={onGoLogin} dark />
        <div style={{ padding: '0 24px', marginTop: 30 }}>
          <div className="auth-logo">⚖️</div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-sub" style={{ marginTop: 8 }}>
            Enter your email and we'll send you a secure link to reset your password.
          </p>
        </div>
      </div>

      <div className="auth-form-card" style={{ marginTop: -40 }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 50, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontSize: 20, color: '#0F172A', marginBottom: 8, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              Check your email
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.5, marginBottom: 24 }}>
              We've sent a password reset link to<br/><strong>{email}</strong>
            </p>
            <button className="btn btn-primary" onClick={onGoLogin} style={{ width: '100%' }}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
              />
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#DC2626' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !email}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                  Sending Link…
                </span>
              ) : 'Send Reset Link →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
