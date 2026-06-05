import React, { useState, useEffect, useMemo } from 'react';
import { StatusBar, BottomNav } from '../components/Layout';
import Icon from '../components/Icon';
import { getUserDocuments } from '../firebase/auth';
import { auth } from '../firebase/config';
import './Documents.css';

const FILTERS = ['All', 'Rental', 'Employment', 'Finance', 'Legal'];

export default function DocumentsScreen({ onDoc, onUpload, onNav }) {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      if (!auth.currentUser) return;
      try {
        const docs = await getUserDocuments(auth.currentUser.uid);
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to fetch docs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  const filtered = useMemo(() => {
    return documents.filter(d => {
      const name = d.fileName || 'Document';
      const matchSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'All' || d.type === filter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [search, filter, documents]);

  // Format date correctly
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const DocCard = ({ doc }) => {
    const isLegal = doc.type === 'legal' || doc.type === 'rental';
    const tagClass = isLegal ? 'tag-blue' : 'tag-green';
    const iconColor = isLegal ? '#2563EB' : '#059669';
    const iconBg = isLegal ? '#EFF6FF' : '#ECFDF5';

    return (
      <div className="doc-list-card" onClick={() => onDoc(doc)}>
        <div className="doc-list-icon" style={{ background: iconBg }}>
          <Icon name="doc" size={20} color={iconColor} />
        </div>
        <div className="doc-list-info">
          <div className="doc-list-name">{doc.fileName || 'Analyzed Document'}</div>
          <div className="doc-list-meta">{doc.language ? doc.language.toUpperCase() : 'EN'} translation</div>
          <div className="doc-list-tags">
            <span className={`tag ${tagClass}`}>{doc.type || 'Document'}</span>
          </div>
        </div>
        <div className="doc-list-right">
          <div className="doc-list-time">{formatTime(doc.createdAt)}</div>
          <Icon name="back" size={13} color="#CBD5E1" style={{ transform: 'scaleX(-1)' }} />
        </div>
      </div>
    );
  };

  return (
    <div className="screen docs-screen" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="docs-header">
        <StatusBar theme="blue" />
        <div className="docs-title-row">
          <div>
            <div className="docs-title">My Documents</div>
            <div className="docs-subtitle">{documents.length} documents analysed</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onUpload}>
            <Icon name="plus" size={18} color="white" />
          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <Icon name="ai" size={16} color="rgba(255,255,255,0.7)" />
          <input
            className="search-input"
            placeholder="Search documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <div style={{ cursor: 'pointer' }} onClick={() => setSearch('')}>
              <Icon name="plus" size={14} color="rgba(255,255,255,0.7)" style={{ transform: 'rotate(45deg)' }} />
            </div>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="filter-row">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Document list */}
      <div className="scroll-body docs-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-mid)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="docs-empty">
            <div className="docs-empty-icon">
              <Icon name="files" size={30} color="#94A3B8" />
            </div>
            <div className="docs-empty-title">No documents found</div>
            <div className="docs-empty-sub">
              {search ? `No results for "${search}"` : 'Upload your first document to get started'}
            </div>
          </div>
        ) : (
          <>
            <div className="docs-section-label">All Saved Documents</div>
            {filtered.map(d => <DocCard key={d.id} doc={d} />)}
          </>
        )}
        <div style={{ height: 16 }} />
      </div>

      {/* FAB — Upload */}
      <button className="fab" onClick={onUpload} title="Upload new document">
        <Icon name="upload" size={22} color="white" />
      </button>

      <BottomNav active="docs" onNav={onNav} />
    </div>
  );
}
