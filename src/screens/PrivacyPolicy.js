import React from 'react';
import { StatusBar, TopBar } from '../components/Layout';

export default function PrivacyPolicyScreen({ onBack }) {
  return (
    <div className="screen scroll-body" style={{ background: 'var(--bg)' }}>
      <StatusBar theme="dark" />
      <TopBar title="Privacy Policy" onBack={onBack} />
      
      <div style={{ padding: '24px 18px' }}>
        <div style={{ 
          background: 'var(--card)', 
          borderRadius: 16, 
          padding: 20, 
          border: '1px solid var(--border)',
          color: 'var(--text-dark)',
          fontSize: 14,
          lineHeight: 1.6
        }}>
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-display)', marginBottom: 12 }}>1. Introduction</h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: 20 }}>
            Welcome to LegalEase. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at support@legalease.app.
          </p>

          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-display)', marginBottom: 12 }}>2. Information We Collect</h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: 20 }}>
            We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information. We also collect the documents and photos you upload for the sole purpose of analyzing and summarizing them.
          </p>

          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-display)', marginBottom: 12 }}>3. How We Use Your Information</h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: 20 }}>
            We use personal information collected via our App for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            <br/><br/>
            - To facilitate account creation and logon process.<br/>
            - To provide and manage your documents.<br/>
            - To perform AI-powered legal analysis.
          </p>

          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-display)', marginBottom: 12 }}>4. Will Your Information Be Shared With Anyone?</h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: 20 }}>
            We only share and disclose your information in the following situations:<br/>
            - <strong>Compliance with Laws:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.<br/>
            - <strong>Third-Party Service Providers:</strong> We use OCR.Space and OpenRouter APIs to process the text of your documents. Your documents are sent securely to these services solely for the purpose of generating the analysis you requested.
          </p>

          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-display)', marginBottom: 12 }}>5. Is Your Information Transferred Internationally?</h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: 20 }}>
            Our servers are located in multiple regions. If you are accessing our App from outside these regions, please be aware that your information may be transferred to, stored, and processed by us in our facilities and by those third parties with whom we may share your personal information.
          </p>

          <p style={{ color: 'var(--text-light)', fontSize: 12, marginTop: 30, textAlign: 'center' }}>
            Last updated: June 2026
          </p>
        </div>
      </div>
    </div>
  );
}
