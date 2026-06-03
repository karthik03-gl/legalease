import React, { useState, useMemo } from 'react';
import { StatusBar, BottomNav } from '../components/Layout';
import Icon from '../components/Icon';
import './Documents.css';

const ALL_DOCS = [
  { id: 1, name: 'Rental agreement.pdf',        date: 'Mar 25, 2026', time: '2:30 PM', type: 'rental',     size: '1.2 MB', pages: 4, tag: 'Rental',     tagClass: 'tag-blue',  iconBg: '#EFF6FF', iconColor: '#2563EB' },
  { id: 2, name: 'Employment offer letter.pdf',  date: 'Mar 18, 2026', time: '11:15 AM', type: 'employment', size: '0.8 MB', pages: 3, tag: 'Employment', tagClass: 'tag-green', iconBg: '#ECFDF5', iconColor: '#059669' },
  { id: 3, name: 'Loan sanction letter.pdf',     date: 'Mar 10, 2026', time: '9:00 AM',  type: 'finance',   size: '2.1 MB', pages: 6, tag: 'Finance',    tagClass: 'tag-amber', iconBg: '#FFFBEB', iconColor: '#D97706' },
  { id: 4, name: 'Property sale deed.pdf',       date: 'Feb 28, 2026', time: '4:45 PM', type: 'legal',      size: '3.4 MB', pages: 12, tag: 'Legal',     tagClass: 'tag-blue',  iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  { id: 5, name: 'Insurance policy.pdf',         date: 'Feb 20, 2026', time: '1:00 PM', type: 'finance',    size: '1.6 MB', pages: 8, tag: 'Finance',    tagClass: 'tag-amber', iconBg: '#FFFBEB', iconColor: '#D97706' },
  { id: 6, name: 'Court notice.pdf',             date: 'Feb 12, 2026', time: '10:30 AM', type: 'legal',     size: '0.5 MB', pages: 2, tag: 'Legal',     tagClass: 'tag-blue',  iconBg: '#FEF2F2', iconColor: '#DC2626' },
];

const FILTERS = ['All', 'Rental', 'Employment', 'Finance', 'Legal'];

export default function DocumentsScreen({ onDoc, onUpload, onNav }) {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');

  const filtered = useMemo(() => {
    return ALL_DOCS.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'All' || d.tag === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  // Group by date
  const today    = filtered.filter(d => d.date === 'Mar 25, 2026');
  const thisWeek = filtered.filter(d => ['Mar 18, 2026', 'Mar 10, 2026'].includes(d.date));
  const older    = filtered.filter(d => !today.includes(d) && !thisWeek.includes(d));

  const DocCard = ({ doc }) => (
    <div className="doc-list-card" onClick={() => onDoc(doc)}>
      <div className="doc-list-icon" style={{ background: doc.iconBg }}>
        <Icon name="doc" size={20} color={doc.iconColor} />
      </div>
      <div className="doc-list-info">
        <div className="doc-list-name">{doc.name}</div>
        <div className="doc-list-meta">{doc.pages} pages · {doc.size}</div>
        <div className="doc-list-tags">
          <span className={`tag ${doc.tagClass}`}>{doc.tag}</span>
        </div>
      </div>
      <div className="doc-list-right">
        <div className="doc-list-time">{doc.time}</div>
        <Icon name="back" size={13} color="#CBD5E1" style={{ transform: 'scaleX(-1)' }} />
      </div>
    </div>
  );

  const Section = ({ title, docs }) =>
    docs.length > 0 ? (
      <>
        <div className="docs-section-label">{title}</div>
        {docs.map(d => <DocCard key={d.id} doc={d} />)}
      </>
    ) : null;

  return (
    <div className="screen docs-screen" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="docs-header">
        <StatusBar theme="blue" />
        <div className="docs-title-row">
          <div>
            <div className="docs-title">My Documents</div>
            <div className="docs-subtitle">{ALL_DOCS.length} documents analysed</div>
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
        {filtered.length === 0 ? (
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
            <Section title="Today"     docs={today}    />
            <Section title="This Week" docs={thisWeek} />
            <Section title="Earlier"   docs={older}    />
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
