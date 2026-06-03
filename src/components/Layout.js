import React from 'react';
import Icon from './Icon';

export function StatusBar({ theme = 'blue' }) {
  const timeClass = theme === 'light' ? 'status-time dark-text' : 'status-time';
  const dotClass  = theme === 'light' ? 'status-dot dark-dot'   : 'status-dot';
  return (
    <div className={`status-bar ${theme}`}>
      <span className={timeClass}>9:41</span>
      <div className="status-icons">
        <div className={dotClass} />
        <div className={dotClass} />
        <div className={dotClass} />
      </div>
    </div>
  );
}

export function TopBar({ title, onBack, dark = false, right }) {
  return (
    <div className={`top-bar${dark ? ' dark' : ''}`}>
      <button className={`back-btn${dark ? ' dark-btn' : ''}`} onClick={onBack}>
        <Icon name="back" size={16} color={dark ? 'white' : '#64748B'} />
      </button>
      <span className={`top-bar-title${dark ? ' white' : ''}`}>{title}</span>
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  );
}

export function BottomNav({ active = 'home', onNav }) {
  const items = [
    { id: 'home',     label: 'Home',      icon: 'home'     },
    { id: 'docs',     label: 'Documents', icon: 'files'    },
    { id: 'ai',       label: 'Ask AI',    icon: 'ai'       },
    { id: 'settings', label: 'Settings',  icon: 'settings' },
  ];
  return (
    <div className="bottom-nav">
      {items.map(item => (
        <button
          key={item.id}
          className={`nav-item${active === item.id ? ' active' : ''}`}
          onClick={() => onNav?.(item.id)}
        >
          <div className="nav-icon-wrap">
            <Icon
              name={item.icon}
              size={17}
              color={active === item.id ? '#2563EB' : '#94A3B8'}
            />
          </div>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
