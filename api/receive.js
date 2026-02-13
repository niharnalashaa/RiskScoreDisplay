// api/receive.js
// Vercel serverless function: accepts JSON POST from n8n (risk score payload) and holds the latest in memory.
// GET returns the latest payload so the HTML page can fetch and display it.
// Demo: in-memory storage (global.__latestPayload) — not for production persistence.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const requiredKey = process.env.API_KEY || '';
  if (requiredKey) {
    const provided = (req.headers['x-api-key'] || '').toString();
    if (!provided || provided !== requiredKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { /* leave as-is */ }
    }
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Expected JSON object in request body' });
    }
    // n8n may send array of one item; store as-is so GET returns same shape
    global.__latestPayload = {
      payload: body,
      receivedAt: new Date().toISOString()
    };
    return res.status(200).json({ status: 'ok', received: body });
  }

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    const latest = global.__latestPayload || null;
    return res.status(200).json({ status: 'ok', latest });
  }

  return res.status(405).end();
};
