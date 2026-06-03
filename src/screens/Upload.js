import React, { useState, useRef } from 'react';
import { StatusBar, TopBar } from '../components/Layout';
import Icon from '../components/Icon';
import './Upload.css';

const DOC_TYPES = [
  { id: 'rental',     label: 'Rental',     sub: 'Lease / agreement', icon: 'doc',   color: '#2563EB', bg: '#EFF6FF' },
  { id: 'employment', label: 'Employment', sub: 'Offer / contract',  icon: 'files', color: '#059669', bg: '#ECFDF5' },
  { id: 'legal',      label: 'Legal',      sub: 'Court / affidavit', icon: 'doc',   color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'finance',    label: 'Finance',    sub: 'Loan / insurance',  icon: 'save',  color: '#D97706', bg: '#FFFBEB' },
];

const LANGUAGES = [
  { id: 'en', name: 'English', script: 'English',  flag: '🇬🇧' },
  { id: 'hi', name: 'Hindi',   script: 'हिंदी',     flag: '🇮🇳' },
  { id: 'kn', name: 'Kannada', script: 'ಕನ್ನಡ',     flag: '🏳️' },
  { id: 'ta', name: 'Tamil',   script: 'தமிழ்',     flag: '🏳️' },
  { id: 'te', name: 'Telugu',  script: 'తెలుగు',     flag: '🏳️' },
  { id: 'ml', name: 'Malayalam', script: 'മലയാളം',  flag: '🏳️' },
  { id: 'bn', name: 'Bengali', script: 'বাংলা',     flag: '🏳️' },
  { id: 'mr', name: 'Marathi', script: 'मराठी',     flag: '🏳️' },
];

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function UploadScreen({ onBack, onAnalyse }) {
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [docType, setDocType]   = useState('rental');
  const [lang, setLang]         = useState('en');
  const inputRef = useRef();

  const handleFile = f => { if (f) setFile(f); };
  const handleDrop = e => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <div className="screen upload-screen">
      <StatusBar theme="blue" />
      <TopBar title="Upload Document" onBack={onBack} />
      <div className="upload-body">

        {/* Drop zone */}
        {!file ? (
          <div
            className={`drop-zone${dragOver ? ' drag-over' : ''}`}
            onClick={() => inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input ref={inputRef} type="file" className="hidden-input"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={e => handleFile(e.target.files[0])} />
            <div className="drop-icon"><Icon name="upload" size={28} color="#2563EB" /></div>
            <div className="drop-title">Tap to upload a document</div>
            <div className="drop-sub">Drag & drop or browse from your device</div>
            <div className="drop-formats">
              {['PDF','JPG','PNG','DOC','DOCX'].map(f => <span key={f} className="format-pill">{f}</span>)}
            </div>
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-preview-icon"><Icon name="doc" size={22} color="#2563EB" /></div>
            <div className="file-preview-info">
              <div className="file-preview-name">{file.name}</div>
              <div className="file-preview-size">{formatBytes(file.size)}</div>
              <div className="file-preview-status">
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#10B981', display:'inline-block' }} />
                Ready to analyse
              </div>
            </div>
            <button className="remove-btn" onClick={() => setFile(null)}>
              <Icon name="plus" size={14} color="#EF4444" style={{ transform:'rotate(45deg)' }} />
            </button>
          </div>
        )}

        {/* Document type */}
        <div>
          <div className="section-label">Document type</div>
          <div className="doc-type-grid">
            {DOC_TYPES.map(dt => (
              <div key={dt.id} className={`doc-type-card${docType === dt.id ? ' selected' : ''}`} onClick={() => setDocType(dt.id)}>
                <div className="doc-type-icon" style={{ background: dt.bg }}>
                  <Icon name={dt.icon} size={18} color={dt.color} />
                </div>
                <div className="doc-type-label">{dt.label}</div>
                <div className="doc-type-sub">{dt.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Output language — now 3 options */}
        <div>
          <div className="section-label">Output language</div>
          <div className="lang-selector">
            {LANGUAGES.map(l => (
              <div key={l.id} className={`lang-card${lang === l.id ? ' selected' : ''}`} onClick={() => setLang(l.id)}>
                <div style={{ fontSize:20 }}>{l.flag}</div>
                <div className="lang-card-name">{l.name}</div>
                <div className="lang-card-label">{l.script}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Analyse button */}
        <div className="analyse-btn-wrap">
          <button className="analyse-btn" onClick={() => onAnalyse({ file, docType, lang })} disabled={!file}>
            <Icon name="ai" size={20} color="white" />
            {file ? `Analyse in ${LANGUAGES.find(l => l.id === lang)?.name}` : 'Select a document first'}
          </button>
        </div>

      </div>
    </div>
  );
}
