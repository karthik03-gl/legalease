export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '';
  const OCRSPACE_KEY = process.env.REACT_APP_OCRSPACE_API_KEY || '';

  return res.status(200).json({
    ok: true,
    openRouterKeyFound: !!OPENROUTER_KEY,
    ocrSpaceKeyFound: !!OCRSPACE_KEY,
  });
}
