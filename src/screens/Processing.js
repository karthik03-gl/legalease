import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, TopBar } from '../components/Layout';
import Icon from '../components/Icon';
import { analyseDocument, checkHealth } from '../services/ai';
import './Processing.css';

const STEPS = [
  'Extracting text from document',
  'Detecting language & document type',
  'AI simplifying legal content',
];

const DEMO = {
  lang: 'en',
  docTitle:   'Rental Agreement',
  parties:    'Landlord: Ramesh Kumar  |  Tenant: Priya Sharma',
  keyDates:   '11 months from April 2026 (expires March 2027)',
  keyAmounts: '₹18,000/month rent  ·  ₹54,000 security deposit',
  summary:    'This is a rental agreement for a 1BHK flat in Koramangala, Bengaluru. The lease runs for 11 months starting April 2026 at ₹18,000 per month.',
  important:  'Security deposit ₹54,000 (3 months) refundable on exit. 30 days written notice required. No subletting without consent. Late rent: 2% monthly penalty.',
  meaning:    'Give 30 days written notice before leaving. Keep a signed copy. Landlord cannot enter without prior notice. Deposit returned within 30 days of vacating, minus damages.',
};

const wait = ms => new Promise(r => setTimeout(r, ms));

/* ── Countdown timer ──────────────────────────────────── */
function Countdown({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onDone(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const pct = ((seconds - left) / seconds) * 100;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, margin:'10px 0' }}>
      <div style={{ position:'relative', width:56, height:56 }}>
        <svg width="56" height="56" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="#FDE68A" strokeWidth="4"/>
          <circle cx="28" cy="28" r="24" fill="none" stroke="#F59E0B" strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
            style={{ transition:'stroke-dashoffset 1s linear' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:16, fontWeight:700, color:'#92400E', fontFamily:'monospace' }}>{left}</span>
        </div>
      </div>
      <span style={{ fontSize:11, color:'#92400E' }}>Auto-retrying in {left}s…</span>
    </div>
  );
}

/* ── Error card ───────────────────────────────────────── */
function ErrorCard({ code, onRetry, onDemo }) {
  const isServerDown = code === 'SERVER_DOWN' || code === 'NETWORK_ERROR';
  const isKeyError   = code === 'NO_KEY'      || code === 'INVALID_KEY';
  const isRateLimit  = code === 'RATE_LIMIT';
  const [counting, setCounting] = useState(isRateLimit);
  const handleDone = useCallback(() => { setCounting(false); onRetry(); }, [onRetry]);

  const TITLES = {
    SERVER_DOWN:   '🔌 Proxy server not running',
    NETWORK_ERROR: '🌐 Network error',
    NO_KEY:        '🔑 API key missing',
    INVALID_KEY:   '🔑 API key invalid',
    RATE_LIMIT:    '⏳ Rate limited — auto-retrying',
  };

  const STEPS_GUIDE = {
    SERVER_DOWN: [
      'Open a NEW terminal in VS Code',
      'Go to:  Terminal → New Terminal',
      'Make sure you are in the legalease/ folder',
      'Run:   node server.js',
      'Wait for:   ✅ LegalEase – Google Gemini Proxy',
      'Come back and click "Try Again"',
    ],
    NETWORK_ERROR: [
      'Check your internet connection',
      'Make sure  node server.js  is running',
      'Click "Try Again" after a few seconds',
    ],
    NO_KEY: [
      'Go to:  aistudio.google.com/apikey',
      'Sign in with Google → "Create API Key" → Copy it',
      'Open  .env.local  in your legalease/ folder',
      'Add this line (no quotes, no spaces):',
      '   REACT_APP_GEMINI_API_KEY=AIzaSyYourKey',
      'Save file → restart:   node server.js',
    ],
    INVALID_KEY: [
      'Your API key is wrong or expired',
      'Go to:  aistudio.google.com/apikey',
      'Create a new key (starts with  AIzaSy)',
      'Update .env.local with the new key',
      'Restart:   Ctrl+C → node server.js',
    ],
    RATE_LIMIT: [
      'Gemini free tier: 15 requests per minute',
      'Server is trying 5 different Gemini models',
      'Waiting a few seconds between each attempt',
      'If all fail, the timer auto-retries for you',
      'Or click "Try Again" after 60 seconds',
    ],
  };

  const title = TITLES[code] || `Error: ${code}`;
  const steps = STEPS_GUIDE[code] || STEPS_GUIDE['NETWORK_ERROR'];
  const badgeColor = isRateLimit ? '#FEF3C7' : '#FEF2F2';
  const titleColor = isRateLimit ? '#B45309' : '#DC2626';

  return (
    <div className="process-card">
      {/* Error icon */}
      <div className="spinner-wrap">
        <div style={{ width:72, height:72, borderRadius:'50%', background: badgeColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {isRateLimit
            ? <span style={{ fontSize:30 }}>⏳</span>
            : <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
              </svg>
          }
        </div>
      </div>

      <div className="process-title" style={{ color: titleColor }}>{title}</div>
      <div className="process-sub" style={{ fontSize:12, marginBottom:0 }}>
        {isServerDown && 'The proxy server (node server.js) is not running.'}
        {isKeyError   && 'Your Gemini API key has a problem.'}
        {isRateLimit  && 'Server is automatically trying all available models.'}
      </div>

      {/* Countdown */}
      {isRateLimit && counting && <Countdown seconds={30} onDone={handleDone} />}

      {/* Fix guide */}
      <div style={{ background:'#FFFBEB', border:'1.5px solid #FCD34D', borderRadius:12, padding:'12px 14px', marginTop:10 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:8 }}>
          {isRateLimit ? 'What is happening:' : 'How to fix this:'}
        </div>
        {steps.map((s, i) => {
          const isMono = s.startsWith('   ');
          return (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:5, fontSize:12, color:'#92400E', alignItems:'flex-start' }}>
              {!isMono && <span style={{ fontWeight:700, flexShrink:0, minWidth:16 }}>{i + 1}.</span>}
              <span style={{
                fontFamily: isMono ? 'monospace' : 'inherit',
                background: isMono ? '#FEF9C3' : 'transparent',
                padding:    isMono ? '2px 6px' : 0,
                borderRadius: isMono ? 4 : 0,
                marginLeft: isMono ? 24 : 0,
                wordBreak: 'break-all',
              }}>
                {s.trim()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display:'flex', gap:10, marginTop:14 }}>
        <button className="btn btn-outline" style={{ flex:1 }} onClick={onRetry} disabled={counting}>
          {counting ? 'Retrying…' : '↻ Try Again'}
        </button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={() => onDemo(DEMO)}>
          See Demo →
        </button>
      </div>
    </div>
  );
}

/* ── Main Processing Screen ───────────────────────────── */
export default function ProcessingScreen({ uploadData, onDone }) {
  const [step, setStep]       = useState(0);
  const [done, setDone]       = useState([false, false, false]);
  const [finished, setFin]    = useState(false);
  const [errCode, setErrCode] = useState('');
  const [result, setResult]   = useState(null);
  const [attempt, setAttempt] = useState(0);

  const advance = i => {
    setStep(i);
    setDone(prev => prev.map((v, idx) => idx < i ? true : v));
  };

  useEffect(() => {
    let cancelled = false;
    setErrCode(''); setDone([false,false,false]);
    setStep(0); setFin(false); setResult(null);

    const run = async () => {
      try {
        // Demo mode — no file
        if (!uploadData?.file) {
          await wait(500);  if (cancelled) return; advance(0);
          await wait(800);  if (cancelled) return; advance(1);
          await wait(1100); if (cancelled) return; advance(2);
          if (cancelled) return;
          setDone([true,true,true]); setResult(DEMO); setFin(true);
          setTimeout(() => { if (!cancelled) onDone(DEMO); }, 600);
          return;
        }

        // Check server health first
        const health = await checkHealth();
        if (!health.ok)       throw new Error('SERVER_DOWN');
        if (!health.keyFound) throw new Error('NO_KEY');

        // Run AI analysis
        const res = await analyseDocument(
          uploadData.file,
          uploadData.docType || 'rental',
          uploadData.lang    || 'en',
          i => { if (!cancelled) advance(i); },
        );

        if (cancelled) return;
        setDone([true,true,true]);
        const final = { ...res, lang: uploadData.lang || 'en' };
        setResult(final); setFin(true);
        setTimeout(() => { if (!cancelled) onDone(final); }, 600);

      } catch (e) {
        if (!cancelled) setErrCode(e.message || 'UNKNOWN');
      }
    };

    run();
    return () => { cancelled = true; };
  }, [attempt]); // eslint-disable-line

  /* Error view */
  if (errCode) {
    return (
      <div className="screen processing-screen">
        <StatusBar theme="blue" />
        <TopBar title="Processing" onBack={() => onDone(DEMO)} />
        <div className="processing-body">
          <ErrorCard code={errCode} onRetry={() => setAttempt(a => a + 1)} onDemo={onDone} />
        </div>
      </div>
    );
  }

  /* Normal / loading / success view */
  return (
    <div className="screen processing-screen">
      <StatusBar theme="blue" />
      <TopBar title="Processing" onBack={() => onDone(result || DEMO)} />
      <div className="processing-body">
        <div className="process-card">

          <div className="spinner-wrap">
            {finished
              ? <div style={{ width:72, height:72, borderRadius:'50%', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name="check" size={34} color="#10B981" />
                </div>
              : <div className="spinner" />}
          </div>

          <div className="process-title">
            {finished ? 'Analysis complete!' : 'Analysing your document'}
          </div>
          <div className="process-sub">
            {finished
              ? 'Your plain-language summary is ready.'
              : uploadData?.file ? `Reading "${uploadData.file.name}"…` : 'Loading demo…'}
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{
              width: finished ? '100%' : done[1] ? '70%' : done[0] ? '35%' : '10%',
              transition: 'width 0.6s ease',
              animation: finished ? 'none' : undefined,
            }} />
          </div>
          <div className="progress-pct">
            {finished ? '100% — Done!' : `Step ${Math.min(step + 1, 3)} of 3`}
          </div>

          <div className="steps">
            {STEPS.map((label, i) => {
              const isDone   = done[i];
              const isActive = !isDone && step === i && !finished;
              return (
                <React.Fragment key={i}>
                  <div className="step-row">
                    <div className={`step-circle ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
                      {isDone ? <Icon name="check" size={13} color="white" />
                        : isActive ? <div style={{ width:9, height:9, borderRadius:'50%', background:'#2563EB' }} />
                        : null}
                    </div>
                    <span className={`step-label${isDone || isActive ? '' : ' muted'}`}>
                      {label}{isActive ? '…' : ''}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`step-connector${isDone ? ' done' : ' pending'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="process-hint">Usually takes less than 5 seconds</div>

          <button
            className="btn btn-primary"
            style={{ marginTop:20, opacity: finished ? 1 : 0.4, pointerEvents: finished ? 'auto' : 'none' }}
            onClick={() => onDone(result || DEMO)}
          >
            View Results →
          </button>
        </div>
      </div>
    </div>
  );
}
