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

  const OCRSPACE_KEY = process.env.REACT_APP_OCRSPACE_API_KEY || '';

  if (!OCRSPACE_KEY) {
    return res.status(401).json({ error: 'Missing REACT_APP_OCRSPACE_API_KEY environment variable' });
  }

  try {
    const { base64Image } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'Missing base64Image in request body' });
    }

    const postData = new URLSearchParams({
      apikey: OCRSPACE_KEY,
      base64Image: base64Image,
      language: 'eng',
      isOverlayRequired: false,
    });

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postData.toString(),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('OCR.Space proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
