import React, { useState, useEffect } from 'react';
import { StatusBar, BottomNav } from '../components/Layout';
import Icon from '../components/Icon';
import { updateUserPreferences } from '../firebase/auth';
import './Settings.css';

export default function SettingsScreen({ user, userData, onNav, onLogout }) {
  const [notifs, setNotifs]   = useState(true);
  const [darkMode, setDark]   = useState(() => localStorage.getItem('theme') === 'dark');
  const [autoLang, setAuto]   = useState(true);
  const [saveLocal, setSave]  = useState(true);
  
  // Use preferredLang from DB or fallback to 'en'
  const [lang, setLang] = useState(userData?.preferredLang || 'en');

  const displayName = userData?.name || user?.displayName || 'User';
  const displayEmail = user?.email || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  const handleThemeToggle = (checked) => {
    setDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLangSelect = async (newLang) => {
    setLang(newLang);
    if (user?.uid) {
      try {
        await updateUserPreferences(user.uid, { preferredLang: newLang });
      } catch (e) {
        console.error('Failed to save lang', e);
      }
    }
  };

  const openLink = (url) => {
    window.open(url, '_blank');
  };

  const alertComingSoon = () => {
    alert('This feature will be available in the next update!');
  };

  const Row = ({ icon, iconBg, iconColor, label, sub, value, toggle, toggleVal, onToggle, danger, onClick }) => (
    <div className="settings-row" onClick={onClick}>
      <div className="settings-row-icon" style={{ background: iconBg }}>
        <Icon name={icon} size={17} color={iconColor} />
      </div>
      <div className="settings-row-info">
        <div className="settings-row-label" style={danger ? { color: 'var(--red)' } : {}}>{label}</div>
        {sub && <div className="settings-row-sub">{sub}</div>}
      </div>
      <div className="settings-row-right">
        {value && <span className="settings-row-value">{value}</span>}
        {toggle ? (
          <label className="toggle-wrap" onClick={e => e.stopPropagation()}>
            <input type="checkbox" checked={toggleVal} onChange={e => onToggle(e.target.checked)} />
            <span className="toggle-track" />
            <span className="toggle-thumb" />
          </label>
        ) : (
          <Icon name="back" size={13} color="#CBD5E1" style={{ transform: 'scaleX(-1)' }} />
        )}
      </div>
    </div>
  );

  return (
    <div className="screen settings-screen">
      {/* Header */}
      <div className="settings-header">
        <StatusBar theme="blue" />
        <div className="settings-profile">
          <div className="profile-avatar">{initial}</div>
          <div>
            <div className="profile-name">{displayName}</div>
            <div className="profile-email">{displayEmail}</div>
            <div className="profile-plan">✦ Free Plan</div>
          </div>
        </div>
      </div>

      <div className="scroll-body settings-body">

        {/* Account */}
        <div className="settings-section-title">Account</div>
        <div className="settings-group">
          <Row icon="files"    iconBg="#EFF6FF" iconColor="#2563EB" label="Profile"        sub="Edit name & email" onClick={() => onNav('profile')} />
          <Row icon="save"     iconBg="#ECFDF5" iconColor="#059669" label="Saved documents" sub="View past analysis" onClick={() => onNav('documents')} />
          <Row icon="share"    iconBg="#F5F3FF" iconColor="#7C3AED" label="Usage"           sub="Free: 10 analyses/month" value="Active" />
        </div>

        {/* Preferences */}
        <div className="settings-section-title">Preferences</div>
        <div className="settings-group">
          <Row icon="bell"     iconBg="#FFFBEB" iconColor="#D97706" label="Notifications"   sub="New feature alerts"           toggle toggleVal={notifs}    onToggle={setNotifs} />
          <Row icon="ai"       iconBg="#EFF6FF" iconColor="#2563EB" label="Auto-detect language" sub="Detect Kannada automatically" toggle toggleVal={autoLang}  onToggle={setAuto} />
          <Row icon="settings" iconBg="#F1F5F9" iconColor="#64748B" label="Dark mode"       sub="Toggle app theme"             toggle toggleVal={darkMode}  onToggle={handleThemeToggle} />
        </div>

        {/* Language */}
        <div className="settings-section-title">Output language</div>
        <div className="settings-group">
          <Row onClick={() => handleLangSelect('en')} icon="doc" iconBg="#EFF6FF" iconColor="#2563EB" label="English"  sub="Default output" value={lang === 'en' ? '✓' : ''} />
          <Row onClick={() => handleLangSelect('hi')} icon="doc" iconBg="#FFF7ED" iconColor="#EA580C" label="हिंदी" sub="Hindi output" value={lang === 'hi' ? '✓' : ''} />
          <Row onClick={() => handleLangSelect('kn')} icon="doc" iconBg="#ECFDF5" iconColor="#059669" label="ಕನ್ನಡ"    sub="Kannada output" value={lang === 'kn' ? '✓' : ''} />
          <Row onClick={() => handleLangSelect('ta')} icon="doc" iconBg="#FEF2F2" iconColor="#DC2626" label="தமிழ்"    sub="Tamil output" value={lang === 'ta' ? '✓' : ''} />
          <Row onClick={() => handleLangSelect('te')} icon="doc" iconBg="#F5F3FF" iconColor="#7C3AED" label="తెలుగు"   sub="Telugu output" value={lang === 'te' ? '✓' : ''} />
        </div>

        {/* Support */}
        <div className="settings-section-title">Support</div>
        <div className="settings-group">
          <Row onClick={() => onNav('help')} icon="ai"    iconBg="#EFF6FF" iconColor="#2563EB" label="Help centre"     sub="FAQs and guides" />
          <Row onClick={() => openLink('mailto:support@legalease.app')} icon="share" iconBg="#F5F3FF" iconColor="#7C3AED" label="Send feedback"   sub="Help us improve LegalEase" />
          <Row onClick={() => onNav('privacy')} icon="files" iconBg="#F1F5F9" iconColor="#64748B" label="Privacy policy"  sub="How we use your data" />
        </div>

        {/* Danger zone */}
        <div className="settings-section-title">Account</div>
        <button className="danger-btn" onClick={onLogout}>
          <Icon name="back" size={16} color="currentColor" />
          Sign out
        </button>

        <div className="version-text">LegalEase v1.0.0</div>
      </div>

      <BottomNav active="settings" onNav={onNav} />
    </div>
  );
}
