import React, { useState } from 'react';
import { StatusBar, TopBar } from '../components/Layout';
import Icon from '../components/Icon';
import './Scan.css';

export default function ScanScreen({ onBack, onCapture }) {
  const [mode, setMode] = useState(0);

  return (
    <div className="screen scan-screen">
      <StatusBar theme="dark" />
      <TopBar
        title="Scan Document"
        onBack={onBack}
        dark
        right={
          <button className="side-btn" style={{ width: 36, height: 36, borderRadius: 10 }}>
            <Icon name="flash" size={16} color="#F59E0B" />
          </button>
        }
      />

      {/* Camera viewfinder */}
      <div className="viewfinder">
        <div className="vf-bg-dim" />
        <div className="vf-frame">
          <div className="vf-window" />
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />
          <div className="scan-line" />
          <div className="scan-glow" />
          <div className="vf-badge">
            <div className="vf-badge-dot" /> Doc detected
          </div>
          <div className="zoom-pill">1.0×</div>
        </div>
      </div>

      {/* Bottom control panel */}
      <div className="scan-panel">
        <div className="drag-handle" />

        {/* Mode tabs */}
        <div className="mode-tabs">
          {['Auto', 'Manual', 'Batch'].map((m, i) => (
            <button
              key={m}
              className={`mode-tab${mode === i ? ' active' : ''}`}
              onClick={() => setMode(i)}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Gallery thumbnails */}
        <div className="gallery-label">From gallery</div>
        <div className="thumb-strip">
          {[[26,20,14],[22,16,10],[28,22,16],[24,18,12]].map((lines, i) => (
            <div className="thumb" key={i}>
              {lines.map((w, j) => (
                <div key={j} className="thumb-line" style={{ width: w }} />
              ))}
            </div>
          ))}
          <div className="thumb thumb-add">
            <Icon name="plus" size={18} color="#2563EB" />
          </div>
        </div>

        {/* Capture row */}
        <div className="capture-row">
          <button className="side-btn">
            <Icon name="gallery" size={18} />
          </button>

          <div>
            <button className="capture-btn" onClick={onCapture}>
              <div className="cap-mid">
                <div className="cap-inner">
                  <div className="cap-dot" />
                </div>
              </div>
            </button>
            <div className="cap-label">Tap to capture</div>
          </div>

          <button className="side-btn">
            <Icon name="flip" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
