import React, { useState } from 'react';
import { StatusBar, TopBar } from '../components/Layout';
import Icon from '../components/Icon';

const FAQS = [
  {
    q: 'How does LegalEase analyze documents?',
    a: 'LegalEase uses advanced Optical Character Recognition (OCR) to extract text from your uploaded documents or photos. Then, an AI model analyzes the legal jargon and generates a simplified summary in your preferred language.'
  },
  {
    q: 'Is my data and document secure?',
    a: 'Yes! We use industry-standard encryption provided by Google Firebase. Your documents are stored securely in your private account and are never shared with third parties.'
  },
  {
    q: 'How do I change my output language?',
    a: 'Go to the Settings tab and scroll down to "Output language". Select your preferred language, and all future document analyses will be translated automatically.'
  },
  {
    q: 'Are the AI translations legally binding?',
    a: 'No. LegalEase is designed to help you understand complex documents in plain language. It does not provide professional legal advice. Always consult a lawyer for binding legal opinions.'
  },
  {
    q: 'How do I edit my profile?',
    a: 'Go to Settings and tap on "Profile". You can update your display name there.'
  }
];

export default function HelpCenterScreen({ onBack }) {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="screen scroll-body" style={{ background: 'var(--bg)' }}>
      <StatusBar theme="dark" />
      <TopBar title="Help Centre" onBack={onBack} />
      
      <div style={{ padding: '24px 18px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--text-dark)' }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 6 }}>Find answers to common questions about LegalEase.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx} 
                style={{ 
                  background: 'var(--card)', 
                  borderRadius: 14, 
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                <div 
                  onClick={() => toggle(idx)}
                  style={{ 
                    padding: '16px 14px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', paddingRight: 10 }}>{faq.q}</span>
                  <div style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <Icon name="back" size={12} color="var(--text-light)" />
                  </div>
                </div>
                
                {isOpen && (
                  <div style={{ padding: '0 14px 16px', fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, padding: 20, background: 'var(--blue-light)', borderRadius: 16, textAlign: 'center' }}>
          <Icon name="share" size={24} color="var(--blue)" />
          <h3 style={{ fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--blue)', marginTop: 12 }}>Still need help?</h3>
          <p style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 4, marginBottom: 16 }}>Contact our support team directly.</p>
          <a 
            href="mailto:support@legalease.app" 
            style={{ 
              display: 'inline-block', 
              background: 'var(--blue)', 
              color: 'white', 
              textDecoration: 'none', 
              padding: '10px 20px', 
              borderRadius: 20, 
              fontSize: 13, 
              fontWeight: 600 
            }}
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}
