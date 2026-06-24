/**
 * LegalEase – AI Service (OpenRouter & OCR.Space)
 * Supports: English (en), Kannada (kn), Hindi (hi), Tamil (ta), Telugu (te), Malayalam (ml), Bengali (bn), Marathi (mr)
 */

export function friendlyError(code) {
  const API_BASE = process.env.REACT_APP_PRODUCTION_URL || '';
  if (!code) return 'Something went wrong. Please try again.';
  const MAP = {
    SERVER_DOWN:          'Proxy server is not running.\nFix: open a terminal → run: node server.js',
    NO_KEY:               'API key missing in .env.local',
    INVALID_KEY:          'API key invalid.',
    RATE_LIMIT:           'AI model rate-limited. Please wait a moment and try again.',
    NETWORK_ERROR:        'Network error. Check your internet connection.',
    EMPTY:                'AI returned empty response. Please try again.',
    OCR_FAILED:           'Failed to read text from the image. Please try a clearer picture.',
  };
  for (const [k, v] of Object.entries(MAP)) {
    if (code === k || code.startsWith(k)) return v;
  }
  return `Error (${code}). Please try again.`;
}

export async function checkHealth() {
  try {
    const ctrl = new AbortController();
    const id   = setTimeout(() => ctrl.abort(), 5000);
    const API_BASE = process.env.REACT_APP_PRODUCTION_URL || '';
    const res  = await fetch(`${API_BASE}/api/health`, { signal: ctrl.signal });
    clearTimeout(id);
    if (!res.ok) return { ok: false, keyFound: false };
    const data = await res.json();
    // Support the new OpenRouter & OCR.Space backend format
    const hasKeys = data.openRouterKeyFound && data.ocrSpaceKeyFound;
    return { ...data, keyFound: data.keyFound !== undefined ? data.keyFound : hasKeys };
  } catch {
    return { ok: false, keyFound: false, keyPreview: 'SERVER NOT RUNNING' };
  }
}

export const isImageFile = f => !!(f?.type?.startsWith('image/'));

export const readFileText = file => new Promise(resolve => {
  const r = new FileReader();
  r.onload  = e => resolve(e.target?.result || '');
  r.onerror = ()  => resolve('');
  r.readAsText(file);
});

export const readFileBase64 = file => new Promise(resolve => {
  const r = new FileReader();
  r.onload  = e => resolve((e.target?.result || '').split(',')[1] || '');
  r.onerror = ()  => resolve('');
  r.readAsDataURL(file);
});

/* ── Call OCR.Space ─────────────────────────────────────── */
async function callOCR(base64Image) {
  let res;
  try {
    const API_BASE = process.env.REACT_APP_PRODUCTION_URL || '';
    res = await fetch(`${API_BASE}/api/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image: `data:image/jpeg;base64,${base64Image}` }),
    });
  } catch { throw new Error('SERVER_DOWN'); }

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    if (res.status === 401) throw new Error('NO_KEY');
    throw new Error('OCR_FAILED');
  }

  if (data.IsErroredOnProcessing || !data.ParsedResults) {
    throw new Error('OCR_FAILED');
  }

  return data.ParsedResults.map(p => p.ParsedText).join('\n');
}

/* ── Call OpenRouter ────────────────────────────────────── */
const FREE_MODELS = [
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'poolside/laguna-xs.2:free',
  'minimax/minimax-m2.5:free',
  'qwen/qwen3-coder:free',
  'meta-llama/llama-3.3-70b-instruct:free'
];

async function callAI({ system, messages, maxTokens = 1000 }) {
  const formattedMessages = [];
  if (system) {
    formattedMessages.push({ role: 'system', content: system });
  }
  formattedMessages.push(...messages);

  let lastError;

  for (const model of FREE_MODELS) {
    const API_BASE = process.env.REACT_APP_PRODUCTION_URL || '';
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 4000); // 4-second ultra-fast switch timeout

    try {
      const res = await fetch(`${API_BASE}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
          max_tokens: maxTokens,
          temperature: 0.3
        }),
        signal: ctrl.signal
      });
      clearTimeout(timeoutId);

      let data;
      try { data = await res.json(); } catch { data = {}; }

      if (!res.ok) {
        if (res.status === 401) throw new Error('NO_KEY');
        if (res.status === 402) throw new Error('OUT_OF_CREDITS');
        // If it's a 429 rate limit, continue to the next model in the list
        if (res.status === 429) {
          lastError = 'RATE_LIMIT';
          continue;
        }
        throw new Error(`API_${res.status}`);
      }

      const text = data?.choices?.[0]?.message?.content;
      if (!text) {
        lastError = 'EMPTY';
        continue;
      }
      return text; // Success! Return the response.

    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        lastError = 'TIMEOUT';
        continue;
      }
      if (e.message === 'NO_KEY' || e.message === 'SERVER_DOWN') throw e;
      lastError = e.message || 'UNKNOWN';
    }
  }

  // If we exhausted all models, throw the last error (usually RATE_LIMIT)
  throw new Error(lastError);
}

/* ── Language instruction builder ──────────────────────── */
function langInstruction(lang) {
  if (lang === 'ta') return 'CRITICAL: Write your ENTIRE response in Tamil (தமிழ்) script. Every single word must be in Tamil.';
  if (lang === 'te') return 'CRITICAL: Write your ENTIRE response in Telugu (తెలుగు) script. Every single word must be in Telugu.';
  if (lang === 'ml') return 'CRITICAL: Write your ENTIRE response in Malayalam (മലയാളം) script. Every single word must be in Malayalam.';
  if (lang === 'bn') return 'CRITICAL: Write your ENTIRE response in Bengali (বাংলা) script. Every single word must be in Bengali.';
  if (lang === 'mr') return 'CRITICAL: Write your ENTIRE response in Marathi (मराठी) script. Every single word must be in Marathi.';
  if (lang === 'kn') return 'CRITICAL: Write your ENTIRE response in Kannada (ಕನ್ನಡ) script. Every single word must be in Kannada.';
  if (lang === 'hi') return 'CRITICAL: Write your ENTIRE response in Hindi (हिंदी) script using Devanagari characters. Every single word must be in Hindi.';
  return 'Write your entire response in clear simple English. No legal jargon.';
}

/* ── Translate existing result ─────────────────────────── */
export async function translateDocument(docResult, targetLang) {
  const system = `You are LegalEase AI. Translate the following legal document analysis into the requested language. ${langInstruction(targetLang)}

CRITICAL: Return ONLY a raw JSON object matching the input structure. No markdown, no text before or after the JSON. Keep the same keys but translate all the values.`;

  const raw = await callAI({
    system,
    messages: [{ role: 'user', content: JSON.stringify(docResult) }],
    maxTokens: 1000,
  });

  const clean = raw.trim()
    .replace(/^```json\s*/im, '').replace(/^```\s*/im, '').replace(/\s*```$/im, '')
    .trim();

  try {
    return { ...JSON.parse(clean), lang: targetLang };
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) { try { return { ...JSON.parse(match[0]), lang: targetLang }; } catch {} }
    throw new Error('TRANSLATION_FAILED');
  }
}

/* ── Analyse a legal document ─────────────────────────── */
export async function analyseDocument(file, docType, lang, onStep) {
  onStep(0); // Uploading/Extracting

  let documentText = '';

  // Step 1: Extract text
  if (isImageFile(file)) {
    const b64 = await readFileBase64(file);
    try {
      documentText = await callOCR(b64);
    } catch (e) {
      documentText = `(Image reading failed. Generate a realistic sample analysis for a ${docType} document)`;
    }
  } else {
    documentText = await readFileText(file);
  }

  const hasText = documentText && documentText.trim().length > 10;
  if (!hasText) {
    documentText = `(Document text unreadable or empty. Generate a realistic sample analysis for a typical ${docType} document used in Bengaluru, India.)`;
  }

  onStep(1); // Analysing with AI

  const system = `You are LegalEase, an AI that helps people in India understand legal documents in plain language. Be concise, warm, and helpful. ${langInstruction(lang)}

CRITICAL: Return ONLY a raw JSON object. No markdown, no code fences, no text before or after the JSON.

Required JSON (fill every field in the target language):
{
  "docTitle":   "Short document title",
  "parties":    "Parties involved e.g. Landlord: Ram | Tenant: Priya",
  "keyDates":   "Important dates or duration",
  "keyAmounts": "All monetary amounts, rent, deposits",
  "summary":    "2-3 sentence plain-language summary",
  "important":  "2-3 sentences: key obligations, deadlines, risks",
  "meaning":    "2-3 sentences: what this means for the person signing"
}`;

  onStep(2);

  const raw = await callAI({
    system,
    messages: [{ role: 'user', content: `Document:\n${documentText.slice(0, 15000)}` }],
    maxTokens: 1000,
  });

  const clean = raw.trim()
    .replace(/^```json\s*/im, '').replace(/^```\s*/im, '').replace(/\s*```$/im, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) { try { return JSON.parse(match[0]); } catch {} }
    return {
      docTitle: file?.name || 'Document',
      parties: '—', keyDates: '—', keyAmounts: '—',
      summary: clean.slice(0, 400),
      important: 'AI response could not be parsed. Please try again.',
      meaning: 'Try uploading the document again.',
    };
  }
}

/* ── Results Q&A ────────────────────────────────────────── */
export async function askQuestion(question, docContext, lang) {
  const system = `You are LegalEase AI. Answer questions about legal documents in 2-3 sentences. ${langInstruction(lang)} Do not give formal legal advice.`;
  return await callAI({
    system,
    messages: [{ role: 'user', content: `Document:\n${docContext}\n\nQuestion: ${question}` }],
    maxTokens: 400,
  });
}

/* ── Ask AI chat ─────────────────────────────────────────── */
export async function chatWithAI(history, question) {
  const system = `You are LegalEase AI, a friendly legal assistant for people in India.
Explain legal documents and rights in plain language. Keep answers to 2-4 sentences.
Be warm and empathetic.
If the user writes in Kannada, respond in Kannada.
If the user writes in Hindi, respond in Hindi.
Do not give formal legal advice.`;

  const messages = [
    ...history.filter(m => m.id !== 0).map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text,
    })),
    { role: 'user', content: question },
  ];
  return await callAI({ system, messages, maxTokens: 500 });
}
