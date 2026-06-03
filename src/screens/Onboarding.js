import React, { useState, useEffect } from 'react';
import { StatusBar } from '../components/Layout';
import Icon from '../components/Icon';
import './Onboarding.css';

const SLIDES = [
  {
    icon: 'doc',
    iconColor: '#2563EB',
    badge: '📄 Legal Documents',
    title: 'Understand Any Legal Document',
    desc: 'Rental agreements, employment letters, loan documents — get them explained in plain language instantly.',
    deco: [
      { w: 60,  h: 60,  top: 10, right: 20 },
      { w: 40,  h: 40,  bottom: 20, left: 15 },
      { w: 24,  h: 24,  top: 40, left: 30 },
    ],
  },
  {
    icon: 'camera',
    iconColor: '#059669',
    badge: '📷 Scan & Upload',
    title: 'Scan or Upload in Seconds',
    desc: 'Take a photo with your camera or upload a PDF. Our AI reads and simplifies it for you immediately.',
    deco: [
      { w: 48, h: 48, top: 20, left: 20 },
      { w: 32, h: 32, bottom: 30, right: 20 },
      { w: 20, h: 20, top: 50, right: 40 },
    ],
  },
  {
    icon: 'ai',
    iconColor: '#7C3AED',
    badge: '🌐 English & ಕನ್ನಡ',
    title: 'Your Language, Your Rights',
    desc: 'Get results in English or Kannada. Ask follow-up questions and our AI answers instantly.',
    deco: [
      { w: 52, h: 52, top: 15, right: 25 },
      { w: 36, h: 36, bottom: 25, left: 20 },
      { w: 18, h: 18, top: 55, left: 45 },
    ],
  },
];

export default function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const isLast = slide === SLIDES.length - 1;
  const s = SLIDES[slide];

  const next = () => {
    if (isLast) { onDone(); return; }
    setSlide(i => i + 1);
    setAnimKey(k => k + 1);
  };

  const skip = () => onDone();

  // Auto-advance every 4s on first slide
  useEffect(() => {
    if (slide !== 0) return;
    const t = setTimeout(() => { setSlide(1); setAnimKey(k => k + 1); }, 4000);
    return () => clearTimeout(t);
  }, [slide]);

  return (
    <div className="screen onboarding-screen">
      <StatusBar theme="transparent" />

      {/* Slide content */}
      <div className="slide" key={animKey} style={{ animation: 'slideIn 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
        {/* Illustration */}
        <div className="slide-illustration">
          {s.deco.map((d, i) => (
            <div
              key={i}
              className="deco-dot"
              style={{ width: d.w, height: d.h, top: d.top, bottom: d.bottom, left: d.left, right: d.right }}
            />
          ))}
          <div className="slide-illustration-inner">
            <div className="slide-illustration-icon">
              <Icon name={s.icon} size={40} color={s.iconColor} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="slide-title">{s.title}</div>
        <div className="slide-desc">{s.desc}</div>
        <div className="slide-badge">{s.badge}</div>
      </div>

      {/* Footer */}
      <div className="onboarding-footer">
        {/* Nav row */}
        {!isLast && (
          <div className="ob-nav-row">
            <span className="ob-skip" onClick={skip}>Skip</span>
            <button className="ob-next" onClick={next}>
              Next <Icon name="back" size={14} color="white" style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>
        )}

        {/* Dot indicators */}
        <div className="dot-row">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`dot-indicator${slide === i ? ' active' : ''}`}
              style={{ width: slide === i ? 24 : 8 }}
              onClick={() => { setSlide(i); setAnimKey(k => k + 1); }}
            />
          ))}
        </div>

        {/* Final CTA */}
        {isLast ? (
          <>
            <button className="ob-btn-primary" onClick={onDone}>
              Get Started →
            </button>
            <button className="ob-btn-secondary" onClick={onDone}>
              I already have an account
            </button>
          </>
        ) : (
          <button className="ob-btn-primary" onClick={next}>
            {slide === 0 ? 'Let\'s Go →' : 'Continue →'}
          </button>
        )}
      </div>
    </div>
  );
}
