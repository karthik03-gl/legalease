import React, { useState } from 'react';
import { StatusBar, TopBar } from '../components/Layout';
import { updateUserProfile } from '../firebase/auth';
import Icon from '../components/Icon';

export default function ProfileScreen({ user, userData, onBack }) {
  const [name, setName] = useState(userData?.name || user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setSuccess(false);
    try {
      await updateUserProfile(user.uid, name.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onBack) onBack();
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen auth-screen" style={{ background: 'var(--bg)' }}>
      <StatusBar theme="dark" />
      <TopBar title="Edit Profile" onBack={onBack} />
      
      <div style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', 
            background: 'var(--blue-light)', color: 'var(--blue)', 
            fontSize: 32, fontWeight: 700, display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 16px' 
          }}>
            {name ? name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-mid)' }}>
            Update your account details
          </div>
        </div>

        <div className="auth-form-card" style={{ padding: 24, borderRadius: 20, background: 'var(--card)' }}>
          <form onSubmit={handleSave}>
            <div className="input-group">
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase' }}>Full Name</label>
              <input 
                type="text" 
                className="field-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                style={{ marginTop: 8 }}
              />
            </div>

            <div className="input-group" style={{ marginTop: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase' }}>Email Address</label>
              <input 
                type="email" 
                className="field-input"
                value={user?.email || ''}
                disabled
                style={{ marginTop: 8, background: 'var(--bg)', color: 'var(--text-light)', cursor: 'not-allowed' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6, display: 'flex', gap: 4 }}>
                <Icon name="files" size={12} color="var(--text-light)" />
                To change your email address, please contact support.
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 30 }} 
              disabled={loading || !name.trim()}
            >
              {loading ? 'Saving...' : success ? '✓ Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
