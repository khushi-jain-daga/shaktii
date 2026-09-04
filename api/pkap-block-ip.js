export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const ipAddress = String(req.body?.ipAddress || '').trim();
  if (!ipAddress) return res.status(400).json({ success: false, error: 'IP address is required' });
  await new Promise((resolve) => setTimeout(resolve, 450));
  // Safe demo parity with the original project. Connect this action to Cloudflare/AWS WAF/SOAR only after adding authenticated server-side credentials.
  console.log(`[PKAP MOCK WAF] containment requested for ${ipAddress}`);
  return res.status(200).json({ success: true, message: `Containment request recorded for ${ipAddress}.` });
}
