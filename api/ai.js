export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let requestedModel = req.body.model || '';
  
  // CACHE BUSTER & QUOTA BYPASS: 
  // Force all traffic to the lite model to bypass the 503/429 Quota Exceeded errors on the main models.
  // This guarantees that even old cached Android apps will hit the working lite model.
  if (requestedModel.includes('gemini-2.5-flash') || 
      requestedModel.includes('gemini-2.0-flash') || 
      requestedModel.includes('gemini-flash-latest')) {
    requestedModel = 'gemini-2.5-flash-lite';
    req.body.model = requestedModel;
  }

  const isNativeGemini = requestedModel && !requestedModel.includes('/');
  
  let endpoint = '';
  let apiKey = '';
  let headers = { 'Content-Type': 'application/json' };

  if (isNativeGemini) {
    endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else {
    endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    apiKey = process.env.REACT_APP_OPENROUTER_API_KEY || '';
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'https://legalease.app';
    headers['X-Title'] = 'LegalEase';
  }

  if (!apiKey) {
    return res.status(401).json({ error: `Missing API Key for ${isNativeGemini ? 'Gemini' : 'OpenRouter'}` });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Hybrid proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
