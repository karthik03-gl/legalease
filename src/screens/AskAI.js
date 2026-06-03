import React, { useState, useRef, useEffect } from 'react';
import { StatusBar, BottomNav } from '../components/Layout';
import Icon from '../components/Icon';
import { chatWithAI, friendlyError, checkHealth } from '../services/ai';
import './AskAI.css';

const QUICK_PROMPTS = [
  'What is a security deposit?',
  'Can a landlord enter without notice?',
  'What is a notice period?',
  'What does subletting mean?',
  'Explain force majeure',
];

// Offline answers when server is not running
const OFFLINE = {
  'security deposit':  'A security deposit is money paid to the landlord before moving in. It is returned at the end of the lease minus any deductions for unpaid rent or damages. In India it is usually 2–3 months of rent.',
  'landlord enter':    'In India, a landlord generally cannot enter your rented home without giving prior notice (usually 24 hours). Entering without permission may be considered trespassing.',
  'notice period':     'A notice period is advance warning you must give before ending a rental or employment contract. For rentals in India it is usually 30 days, given in writing.',
  'sublet':            'Subletting means renting your home to someone else while you remain the main tenant. Most Indian agreements prohibit this without the landlord\'s written permission.',
  'force majeure':     'Force majeure frees both parties from obligations if an extraordinary event beyond their control occurs — like a natural disaster, war, or pandemic.',
};

function offlineFallback(q) {
  const l = q.toLowerCase();
  for (const [key, ans] of Object.entries(OFFLINE)) {
    if (key.split(' ').every(w => l.includes(w))) return ans;
  }
  return 'The proxy server is not running. Start it with: node server.js\n\nFor offline help, try one of the quick questions above.';
}

function nowStr() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const INITIAL_MSG = {
  id: 0, role: 'ai', time: nowStr(),
  text: 'Hello! I\'m LegalEase AI. Ask me anything about legal documents or your rights. I can answer in English or Kannada (ಕನ್ನಡ).',
};

export default function AskAIScreen({ onNav }) {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState(null); // null | 'ok' | 'error'
  const bottomRef = useRef(null);

  // Check server health on mount
  useEffect(() => {
    checkHealth().then(h => setStatus(h.ok && h.keyFound ? 'ok' : 'warn'));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const addMsg = (role, text) =>
    setMessages(prev => [...prev, { id: Date.now(), role, text, time: nowStr() }]);

  const sendMessage = async (text = input) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');
    addMsg('user', q);
    setLoading(true);

    try {
      const answer = await chatWithAI(messages, q);
      addMsg('ai', answer);
      setStatus('ok');
    } catch (e) {
      if (e.message === 'SERVER_DOWN' || e.message === 'NO_KEY') {
        addMsg('ai', offlineFallback(q));
        setStatus('warn');
      } else {
        addMsg('ai', friendlyError(e.message));
        setStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen askai-screen">
      <div className="askai-header">
        <StatusBar theme="blue" />
        <div className="askai-title-row">
          <div style={{ width: 40, height: 40, borderRadius: 13, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="ai" size={22} color="white" />
          </div>
          <div>
            <div className="askai-title">Ask AI</div>
            <div className="ai-status">
              <div className="ai-status-dot" style={{ background: status === 'ok' ? '#10B981' : status === 'error' ? '#EF4444' : '#F59E0B' }} />
              {status === 'ok' ? 'LegalEase AI · Online' : status === 'error' ? 'Error — check server' : 'LegalEase AI · Demo mode'}
            </div>
          </div>
        </div>
        <div className="askai-sub">Ask anything about legal documents or your rights</div>
      </div>

      {/* Server warning banner */}
      {status === 'warn' && (
        <div style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA', padding: '8px 16px', fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⚠️</span>
          <span>Demo mode — run <code style={{ fontFamily: 'monospace', background: '#FEF3C7', padding: '1px 4px', borderRadius: 3 }}>node server.js</code> for full AI</span>
        </div>
      )}

      {/* Quick prompts */}
      <div className="quick-chips">
        {QUICK_PROMPTS.map(p => (
          <button key={p} className="quick-chip" onClick={() => sendMessage(p)}>{p}</button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-area">
        {messages.map(msg => (
          <div key={msg.id} className={`msg-row${msg.role === 'user' ? ' user' : ''}`}>
            <div className={`msg-avatar ${msg.role === 'ai' ? 'ai' : 'user'}`}>
              {msg.role === 'ai' ? 'AI' : 'K'}
            </div>
            <div>
              <div className={`msg-bubble ${msg.role === 'ai' ? 'ai' : 'user'}`}>{msg.text}</div>
              <div className={`msg-time${msg.role === 'ai' ? ' ai-time' : ''}`}>{msg.time}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg-row">
            <div className="msg-avatar ai">AI</div>
            <div className="msg-bubble ai">
              <div className="typing-bubble">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <textarea
          className="chat-textarea"
          placeholder="Ask about any legal term or document…"
          value={input}
          rows={1}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        />
        <button className="chat-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          {loading
            ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : <Icon name="send" size={16} color="white" />}
        </button>
      </div>

      <BottomNav active="ai" onNav={onNav} />
    </div>
  );
}
