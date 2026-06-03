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
    <div className="screen auth-screen" style={{ 
      background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
      display: 'flex', flexDirection: 'column' 
    }}>
      <StatusBar />
      
      <div className="auth-hero" style={{ height: 'auto', background: 'transparent', paddingBottom: 20 }}>
        <TopBar onBack={onGoLogin} dark />
        <div style={{ padding: '0 24px', marginTop: 10 }}>
          <div className="auth-logo" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white' }}>✨</div>
          <h1 className="auth-title" style={{ color: 'white', marginTop: 16 }}>Reset Password</h1>
          <p className="auth-sub" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 14 }}>
            Enter your email and we'll send you a secure link to reset your password.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24 }}>
        <div className="auth-form-card" style={{ 
          marginTop: 0, 
          background: 'var(--card)', 
          borderRadius: 24, 
          padding: 30,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
        }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>✉️</div>
              <h2 style={{ fontSize: 22, color: 'var(--text-dark)', marginBottom: 12, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                Check your email
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-mid)', lineHeight: 1.5, marginBottom: 30 }}>
                We've sent a password reset link to<br/><strong style={{color: 'var(--text-dark)'}}>{email}</strong>
              </p>
              <button className="btn btn-primary" onClick={onGoLogin} style={{ width: '100%', padding: '16px 0', borderRadius: 14 }}>
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset}>
              <div className="input-group">
                <label style={{ color: 'var(--text-mid)', fontWeight: 600 }}>Email Address</label>
                <input 
                  type="email" 
                  className="field-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  style={{ padding: '16px', borderRadius: 12, fontSize: 15 }}
                />
              </div>

              {error && (
                <div style={{ background: 'var(--red-light)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px 0', borderRadius: 14, marginTop: 10 }} disabled={loading || !email}>
                {loading ? (
                  <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    <div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                    Sending Link...
                  </span>
                ) : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
