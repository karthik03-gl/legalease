import React, { useState } from 'react';
import { StatusBar, BottomNav } from '../components/Layout';
import Icon from '../components/Icon';
import './Settings.css';

export default function SettingsScreen({ onNav, onLogout }) {
  const [notifs, setNotifs]   = useState(true);
  const [darkMode, setDark]   = useState(() => localStorage.getItem('theme') === 'dark');
  const [autoLang, setAuto]   = useState(true);
  const [saveLocal, setSave]  = useState(true);

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
          <div className="profile-avatar">K</div>
          <div>
            <div className="profile-name">Karthik G L</div>
            <div className="profile-email">karthikgl.cs24@bmsce.ac.in</div>
            <div className="profile-plan">✦ Free Plan</div>
          </div>
        </div>
      </div>

      <div className="scroll-body settings-body">

        {/* Account */}
        <div className="settings-section-title">Account</div>
        <div className="settings-group">
          <Row icon="files"    iconBg="#EFF6FF" iconColor="#2563EB" label="Profile"        sub="Edit name & email" />
          <Row icon="save"     iconBg="#ECFDF5" iconColor="#059669" label="Saved documents" sub={`${3} documents saved`} value="3" />
          <Row icon="share"    iconBg="#F5F3FF" iconColor="#7C3AED" label="Usage"           sub="Free: 10 analyses/month" value="6 left" />
        </div>

        {/* Preferences */}
        <div className="settings-section-title">Preferences</div>
        <div className="settings-group">
          <Row icon="bell"     iconBg="#FFFBEB" iconColor="#D97706" label="Notifications"   sub="New feature alerts"           toggle toggleVal={notifs}    onToggle={setNotifs} />
          <Row icon="ai"       iconBg="#EFF6FF" iconColor="#2563EB" label="Auto-detect language" sub="Detect Kannada automatically" toggle toggleVal={autoLang}  onToggle={setAuto} />
          <Row icon="doc"      iconBg="#ECFDF5" iconColor="#059669" label="Save locally"    sub="Keep docs on device"          toggle toggleVal={saveLocal} onToggle={setSave} />
          <Row icon="settings" iconBg="#F1F5F9" iconColor="#64748B" label="Dark mode"       sub="Toggle app theme"             toggle toggleVal={darkMode}  onToggle={handleThemeToggle} />
        </div>

        {/* Language */}
        <div className="settings-section-title">Output language</div>
        <div className="settings-group">
          <Row icon="doc"  iconBg="#EFF6FF" iconColor="#2563EB" label="English"  sub="Default output language" value="✓" />
          <Row icon="doc" iconBg="#FFF7ED" iconColor="#EA580C" label="हिंदी" sub="Hindi output" />
          <Row icon="doc"  iconBg="#ECFDF5" iconColor="#059669" label="ಕನ್ನಡ"    sub="Kannada output" />
          <Row icon="doc"  iconBg="#FEF2F2" iconColor="#DC2626" label="தமிழ்"    sub="Tamil output" />
          <Row icon="doc"  iconBg="#F5F3FF" iconColor="#7C3AED" label="తెలుగు"   sub="Telugu output" />
          <Row icon="doc"  iconBg="#FDF2F8" iconColor="#DB2777" label="മലയാളം" sub="Malayalam output" />
          <Row icon="doc"  iconBg="#FFFBEB" iconColor="#D97706" label="বাংলা"    sub="Bengali output" />
          <Row icon="doc"  iconBg="#F0FDFA" iconColor="#0D9488" label="मराठी"    sub="Marathi output" />
        </div>

        {/* Support */}
        <div className="settings-section-title">Support</div>
        <div className="settings-group">
          <Row icon="ai"    iconBg="#EFF6FF" iconColor="#2563EB" label="Help centre"     sub="FAQs and guides" />
          <Row icon="share" iconBg="#F5F3FF" iconColor="#7C3AED" label="Send feedback"   sub="Help us improve LegalEase" />
          <Row icon="files" iconBg="#F1F5F9" iconColor="#64748B" label="Privacy policy"  sub="How we use your data" />
          <Row icon="doc"   iconBg="#F1F5F9" iconColor="#64748B" label="Terms of service" sub="Legal information" />
        </div>

        {/* Danger zone */}
        <div className="settings-section-title">Account</div>
        <button className="danger-btn" onClick={onLogout}>
          <Icon name="back" size={16} color="currentColor" />
          Sign out
        </button>

        <div className="version-text">LegalEase v1.0.0 · Built with Claude AI</div>
      </div>

      <BottomNav active="settings" onNav={onNav} />
    </div>
  );
}
