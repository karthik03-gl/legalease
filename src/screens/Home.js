import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StatusBar, BottomNav } from '../components/Layout';
import Icon from '../components/Icon';
import './Home.css';

const DOCS = [
  { name: 'Rental agreement.pdf',     date: 'Mar 25, 2026', tag: 'Rental',     tagClass: 'tag-blue'  },
  { name: 'Employment letter.pdf',    date: 'Mar 18, 2026', tag: 'Employment', tagClass: 'tag-green' },
  { name: 'Loan sanction letter.pdf', date: 'Mar 10, 2026', tag: 'Finance',    tagClass: 'tag-amber' },
];

const STATS = [
  { val: '1,240+', label: 'Docs simplified' },
  { val: '2',      label: 'Languages'        },
  { val: '< 5s',   label: 'Avg. time'        },
];

export default function HomeScreen({ onScanPhoto, onUpload, onDoc, onNav }) {
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    try {
      setScanning(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      
      // Convert webPath to a File object
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], "scanned-document.jpg", { type: "image/jpeg" });
      
      setScanning(false);
      if (onScanPhoto) onScanPhoto(file);
    } catch (e) {
      setScanning(false);
      console.log('User cancelled scan or error occurred', e);
    }
  };

  return (
    <div className="screen home-screen">
      {/* Blue gradient header */}
      <div className="home-header">
        <StatusBar theme="blue" />
        <div className="home-header-row">
          <div>
            <div className="home-title">LegalEase</div>
            <div className="home-subtitle">Understand legal docs instantly</div>
          </div>
          <button className="notif-btn" aria-label="Notifications">
            <Icon name="bell" size={18} color="white" />
            <div className="notif-dot" />
          </button>
        </div>
        <div className="hero-card">
          <div className="hero-icon">
            <Icon name="doc" size={24} color="#2563EB" />
          </div>
          <div className="hero-text">
            <h3>Upload or scan a document</h3>
            <p>Get plain-language summaries instantly</p>
          </div>
          <span className="badge badge-green" style={{ fontSize: 9, padding: '3px 10px' }}>AI</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="scroll-body home-body">
        {/* Action buttons */}
        <div className="action-row">
          <button className="action-card action-primary" onClick={onUpload}>
            <div className="action-icon">
              <Icon name="upload" size={22} color="white" />
            </div>
            <div className="action-label">Upload</div>
            <div className="action-sub">From gallery</div>
          </button>
          <button className="action-card action-secondary" onClick={handleScan} disabled={scanning}>
            <div className="action-icon">
              <Icon name="camera" size={22} color="#2563EB" />
            </div>
            <div className="action-label">{scanning ? 'Opening...' : 'Scan'}</div>
            <div className="action-sub">Use camera</div>
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {STATS.map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent docs */}
        <div className="section-header" style={{ marginBottom: 0 }}>
          <span className="section-title">Recent Documents</span>
          <span className="see-all">See all</span>
        </div>
        <div className="doc-list">
          {DOCS.map((doc, i) => (
            <div className="doc-card" key={i} onClick={onDoc}>
              <div className="doc-icon">
                <Icon name="doc" size={20} color="#2563EB" />
              </div>
              <div className="doc-info">
                <div className="doc-name">{doc.name}</div>
                <div className="doc-date">{doc.date}</div>
                <div className="doc-tags">
                  <span className={`tag ${doc.tagClass}`}>{doc.tag}</span>
                </div>
              </div>
              <div className="doc-chevron">
                <Icon name="back" size={14} color="#CBD5E1" style={{ transform: 'scaleX(-1)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" onNav={onNav} />
    </div>
  );
}
