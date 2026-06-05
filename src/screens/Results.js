import React, { useState } from 'react';
import { StatusBar, TopBar, BottomNav } from '../components/Layout';
import Icon from '../components/Icon';
import { askQuestion, translateDocument } from '../services/ai';
import { saveDocumentAnalysis } from '../firebase/auth';
import { Share } from '@capacitor/share';
import './Results.css';

/* ── All UI labels in 8 languages ─────────────────────── */
const LABELS = {
  en: {
    summary:   '📋 Summary',
    important: '⚠️ Important Points',
    meaning:   '💡 What This Means For You',
    parties:   'Parties',
    dates:     'Key Dates',
    amounts:   'Key Amounts',
    ask:       'Ask a question',
    ph:        'e.g. When does my lease end?',
    save:      'Save',
    share:     'Share',
    saved:     'Saved!',
    aiLabel:   '✦ LegalEase AI',
    translating: 'Translating…',
  },
  hi: {
    summary:   '📋 सारांश',
    important: '⚠️ महत्वपूर्ण बातें',
    meaning:   '💡 आपके लिए इसका क्या अर्थ है',
    parties:   'पक्षकार',
    dates:     'मुख्य तारीखें',
    amounts:   'मुख्य राशियाँ',
    ask:       'प्रश्न पूछें',
    ph:        'उदा. मेरा पट्टा कब समाप्त होता है?',
    save:      'सहेजें',
    share:     'साझा करें',
    saved:     'सहेजा गया!',
    aiLabel:   '✦ LegalEase AI',
    translating: 'अनुवाद हो रहा है…',
  },
  kn: {
    summary:   '📋 ಸಾರಾಂಶ',
    important: '⚠️ ಮುಖ್ಯ ಅಂಶಗಳು',
    meaning:   '💡 ನಿಮಗೆ ಇದರ ಅರ್ಥ',
    parties:   'ಪಕ್ಷಗಳು',
    dates:     'ಪ್ರಮುಖ ದಿನಾಂಕಗಳು',
    amounts:   'ಹಣದ ವಿವರ',
    ask:       'ಪ್ರಶ್ನೆ ಕೇಳಿ',
    ph:        'ಉದಾ. ನನ್ನ ಗುತ್ತಿಗೆ ಯಾವಾಗ ಮುಗಿಯುತ್ತದೆ?',
    save:      'ಉಳಿಸಿ',
    share:     'ಹಂಚಿ',
    saved:     'ಉಳಿಸಲಾಗಿದೆ!',
    aiLabel:   '✦ LegalEase AI',
    translating: 'ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ…',
  },
  ta: {
    summary:   '📋 சுருக்கம்',
    important: '⚠️ முக்கிய குறிப்புகள்',
    meaning:   '💡 இதன் பொருள் என்ன',
    parties:   'தரப்பினர்',
    dates:     'முக்கிய தேதிகள்',
    amounts:   'முக்கிய தொகைகள்',
    ask:       'கேள்வி கேட்க',
    ph:        'உதா: எனது குத்தகை எப்போது முடிகிறது?',
    save:      'சேமி',
    share:     'பகிர்',
    saved:     'சேமிக்கப்பட்டது!',
    aiLabel:   '✦ LegalEase AI',
    translating: 'மொழிபெயர்க்கப்படுகிறது…',
  },
  te: {
    summary:   '📋 సారాంశం',
    important: '⚠️ ముఖ్య విషయాలు',
    meaning:   '💡 దీని అర్థం ఏమిటి',
    parties:   'పార్టీలు',
    dates:     'ముఖ్య తేదీలు',
    amounts:   'ముఖ్య మొత్తాలు',
    ask:       'ప్రశ్న అడగండి',
    ph:        'ఉదా: నా లీజు ఎప్పుడు ముగుస్తుంది?',
    save:      'సేవ్ చేయండి',
    share:     'పంచుకోండి',
    saved:     'సేవ్ చేయబడింది!',
    aiLabel:   '✦ LegalEase AI',
    translating: 'అనువదిస్తోంది…',
  },
  ml: {
    summary:   '📋 ചുരുക്കം',
    important: '⚠️ പ്രധാന പോയിന്റുകൾ',
    meaning:   '💡 ഇതിനർത്ഥം എന്താണ്',
    parties:   'കക്ഷികൾ',
    dates:     'പ്രധാന തീയതികൾ',
    amounts:   'പ്രധാന തുകകൾ',
    ask:       'ചോദ്യം ചോദിക്കുക',
    ph:        'ഉദാ: എന്റെ പാട്ടം എപ്പോഴാണ് അവസാനിക്കുന്നത്?',
    save:      'സേവ് ചെയ്യുക',
    share:     'ഷെയർ ചെയ്യുക',
    saved:     'സേവ് ചെയ്തു!',
    aiLabel:   '✦ LegalEase AI',
    translating: 'വിവർത്തനം ചെയ്യുന്നു…',
  },
  bn: {
    summary:   '📋 সারাংশ',
    important: '⚠️ গুরুত্বপূর্ণ পয়েন্ট',
    meaning:   '💡 এর অর্থ কী',
    parties:   'পক্ষসমূহ',
    dates:     'গুরুত্বপূর্ণ তারিখ',
    amounts:   'গুরুত্বপূর্ণ পরিমাণ',
    ask:       'প্রশ্ন জিজ্ঞাসা করুন',
    ph:        'উদা: আমার ইজারা কখন শেষ হবে?',
    save:      'সংরক্ষণ করুন',
    share:     'শেয়ার করুন',
    saved:     'সংরক্ষিত!',
    aiLabel:   '✦ LegalEase AI',
    translating: 'অনুবাদ করা হচ্ছে…',
  },
  mr: {
    summary:   '📋 सारांश',
    important: '⚠️ महत्त्वाचे मुद्दे',
    meaning:   '💡 याचा अर्थ काय',
    parties:   'पक्ष',
    dates:     'महत्त्वाच्या तारखा',
    amounts:   'महत्त्वाची रक्कम',
    ask:       'प्रश्न विचारा',
    ph:        'उदा: माझा भाडेपट्टा कधी संपेल?',
    save:      'जतन करा',
    share:     'शेअर करा',
    saved:     'जतन केले!',
    aiLabel:   '✦ LegalEase AI',
    translating: 'भाषांतर करत आहे…',
  },
};

/* ── Quick questions ───────────────────── */
const QUICK_QS = {
  en: ['When does my lease end?', 'What is the deposit amount?', 'Can I sublet?', 'What is the notice period?'],
  hi: ['मेरा पट्टा कब समाप्त होता है?', 'जमानत राशि कितनी है?', 'क्या मैं उप-किराया दे सकता हूँ?', 'नोटिस अवधि क्या है?'],
  kn: ['ನನ್ನ ಗುತ್ತಿಗೆ ಯಾವಾಗ ಮುಗಿಯುತ್ತದೆ?', 'ಠೇವಣಿ ಮೊತ್ತ ಎಷ್ಟು?', 'ಉಪ-ಬಾಡಿಗೆ ಸಾಧ್ಯವೇ?', 'ನೋಟಿಸ್ ಅವಧಿ ಎಷ್ಟು?'],
  ta: ['எனது குத்தகை எப்போது முடிகிறது?', 'முன்பணம் எவ்வளவு?', 'நான் உள்வாடகைக்கு விடலாமா?', 'அறிவிப்பு காலம் என்ன?'],
  te: ['నా లీజు ఎప్పుడు ముగుస్తుంది?', 'డిపాజిట్ మొత్తం ఎంత?', 'నేను సబ్‌లెట్ చేయవచ్చా?', 'నోటీసు పీరియడ్ ఎంత?'],
  ml: ['എന്റെ പാട്ടം എപ്പോഴാണ് അവസാനിക്കുന്നത്?', 'ഡെപ്പോസിറ്റ് തുക എത്രയാണ്?', 'എനിക്ക് സബ്‌ലെറ്റ് ചെയ്യാമോ?', 'നോട്ടീസ് കാലയളവ് എത്രയാണ്?'],
  bn: ['আমার ইজারা কখন শেষ হবে?', 'আমানতের পরিমাণ কত?', 'আমি কি সাবলেট দিতে পারি?', 'নোটিশ পিরিয়ড কি?'],
  mr: ['माझा भाडेपट्टा कधी संपेल?', 'ठेव रक्कम किती आहे?', 'मी पोटभाड्याने देऊ शकतो का?', 'नोटीस कालावधी काय आहे?'],
};

/* ── Language toggle config ───────────────────────────── */
const LANGS = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'hi', label: 'हिंदी',   flag: '🇮🇳' },
  { id: 'kn', label: 'ಕನ್ನಡ',  flag: '🏳️' },
  { id: 'ta', label: 'தமிழ்',   flag: '🏳️' },
  { id: 'te', label: 'తెలుగు',   flag: '🏳️' },
  { id: 'ml', label: 'മലയാളം',  flag: '🏳️' },
  { id: 'bn', label: 'বাংলা',     flag: '🏳️' },
  { id: 'mr', label: 'मराठी',     flag: '🏳️' },
];

export default function ResultsScreen({ result: initialResult, onBack, onNav }) {
  const safeResult = initialResult || {};
  const [result, setResult] = useState(safeResult);
  const initLang = result.lang || 'en';
  const [lang, setLang]    = useState(initLang);
  const [question, setQ]   = useState('');
  const [aiReply, setAI]   = useState(null);
  const [loading, setLoad] = useState(false);
  const [saved, setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const L  = LABELS[lang] || LABELS.en;
  const qs = QUICK_QS[lang] || QUICK_QS.en;

  const handleTranslate = async (targetLang) => {
    if (lang === targetLang) return;
    setTranslating(true);
    setAI(null);
    setQ('');
    try {
      // Re-translate the existing result data
      const newResult = await translateDocument(result, targetLang);
      setResult(newResult);
      setLang(targetLang);
    } catch (e) {
      console.error(e);
      alert('Failed to translate. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const handleAsk = async (q = question) => {
    if (!q.trim() || loading || translating) return;
    setLoad(true); setAI(null); setQ(q);
    try {
      const ctx = `${result.summary} ${result.important} ${result.meaning}`;
      setAI(await askQuestion(q, ctx, lang));
    } catch {
      setAI(lang === 'hi'
        ? 'क्षमा करें, AI से उत्तर नहीं मिल सका। कृपया पुनः प्रयास करें।'
        : lang === 'kn'
          ? 'ಕ್ಷಮಿಸಿ, AI ಉತ್ತರ ನೀಡಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Sorry, could not get an answer. Please try again.');
    } finally {
      setLoad(false);
    }
  };

  const handleSave = async () => {
    if (saved || saving || !user) return;
    setSaving(true);
    try {
      await saveDocumentAnalysis(user.uid, result);
      setSaved(true);
    } catch (e) {
      console.error('Save failed:', e);
      alert('Failed to save document. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const textToShare = `
*${result.docTitle || 'Legal Document'}*

*Summary:*
${result.summary || ''}

*Important Points:*
${result.important || ''}

*What This Means:*
${result.meaning || ''}

_Generated by LegalEase_
      `.trim();

      await Share.share({
        title: result.docTitle || 'Legal Document Analysis',
        text: textToShare,
        dialogTitle: 'Share Document Analysis',
      });
    } catch (e) {
      console.error('Share failed:', e);
      // Capacitor throws if sharing is unsupported or cancelled, so we ignore silently
    }
  };

  return (
    <div className="screen results-screen">
      <StatusBar theme="blue" />
      <TopBar
        title={result.docTitle || 'Results'}
        onBack={onBack}
        right={
          <button style={{ width:36, height:36, borderRadius:10, background: saved ? '#ECFDF5' : 'white', border:`1px solid ${saved ? '#10B981' : '#E2E8F0'}`, display:'flex', alignItems:'center', justifyContent:'center', cursor: (saved || saving) ? 'default' : 'pointer', transition:'all 0.2s', opacity: saving ? 0.7 : 1 }}
            onClick={handleSave}>
            {saving ? (
              <div style={{ width:14, height:14, border:'2px solid #E2E8F0', borderTopColor:'#64748B', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            ) : (
              <Icon name="save" size={15} color={saved ? '#10B981' : '#64748B'} />
            )}
          </button>
        }
      />

      <div className="scroll-body results-body">

        {/* ── Language Dropdown ── */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-mid)', fontWeight: 600 }}>TRANSLATE:</span>
          <select 
            className="field-input" 
            style={{ width: 'auto', padding: '6px 28px 6px 12px', fontSize: 13, height: 'auto', borderRadius: 'var(--r-md)' }}
            value={lang}
            onChange={e => handleTranslate(e.target.value)}
            disabled={translating}
          >
            {LANGS.map(l => (
              <option key={l.id} value={l.id}>{l.flag} {l.label}</option>
            ))}
          </select>
        </div>

        {translating ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--blue)' }}>
            <div style={{ width:32, height:32, border:'3px solid #DBEAFE', borderTopColor:'#2563EB', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>{L.translating}</div>
          </div>
        ) : (
          <>
            {/* ── Meta info card ── */}
            {(result.parties || result.keyDates || result.keyAmounts) && (
              <div style={{ background:'white', borderRadius:'var(--r-md)', border:'1px solid var(--border)', padding:'14px 16px', marginBottom:12 }}>
                {result.parties && (
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:3 }}>{L.parties}</div>
                    <div style={{ fontSize:12, color:'var(--text-dark)', lineHeight:1.5 }}>{result.parties}</div>
                  </div>
                )}
                {result.keyDates && (
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:3 }}>{L.dates}</div>
                    <div style={{ fontSize:12, color:'var(--text-dark)' }}>{result.keyDates}</div>
                  </div>
                )}
                {result.keyAmounts && (
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:3 }}>{L.amounts}</div>
                    <div style={{ fontSize:12, color:'var(--text-dark)' }}>{result.keyAmounts}</div>
                  </div>
                )}
              </div>
            )}

            {/* ── Result cards ── */}
            <div className="result-card r-summary">
              <div className="result-tag">{L.summary}</div>
              <div className="result-text">{result.summary || '—'}</div>
            </div>
            <div className="result-card r-important">
              <div className="result-tag">{L.important}</div>
              <div className="result-text">{result.important || '—'}</div>
            </div>
            <div className="result-card r-meaning">
              <div className="result-tag">{L.meaning}</div>
              <div className="result-text">{result.meaning || '—'}</div>
            </div>

            {/* ── Action buttons ── */}
            <div className="results-actions">
              <button className="btn btn-outline" onClick={handleSave} disabled={saved || saving} style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? (
                  <div style={{ width:14, height:14, border:'2px solid #E2E8F0', borderTopColor:'#64748B', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                ) : (
                  <Icon name="save" size={15} color={saved ? '#10B981' : '#64748B'} />
                )}
                {saved ? L.saved : (saving ? 'Saving…' : L.save)}
              </button>
              <button className="btn btn-outline" onClick={handleShare}>
                <Icon name="share" size={15} color="#64748B" />{L.share}
              </button>
            </div>

            {/* ── Ask a question ── */}
            <div className="ask-section">
              <div className="ask-title">{L.ask}</div>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
                {qs.map(q => (
                  <button key={q} onClick={() => handleAsk(q)} style={{
                    background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:20,
                    padding:'5px 12px', fontSize:11, color:'#1D4ED8', cursor:'pointer',
                    fontFamily:'var(--font-body)', fontWeight:600, transition:'all 0.15s',
                  }}>{q}</button>
                ))}
              </div>
              <div className="ask-input-row">
                <input className="ask-input" placeholder={L.ph} value={question}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAsk()} />
                <button className="ask-send" onClick={() => handleAsk()} disabled={loading}>
                  {loading
                    ? <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                    : <Icon name="send" size={16} color="white" />}
                </button>
              </div>
              {aiReply && (
                <div className="ai-reply">
                  <div className="ai-reply-label">{L.aiLabel}</div>
                  <div className="ai-reply-text">{aiReply}</div>
                </div>
              )}
            </div>
          </>
        )}
        <div style={{ height:8 }} />
      </div>
      <BottomNav active="docs" onNav={onNav} />
    </div>
  );
}
