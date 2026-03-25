export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  if (!process.env.PLAYFAB_SECRET_KEY) {
    res.status(500).json({ error: 'PLAYFAB_SECRET_KEY no está configurada' });
    return;
  }

  res.json({ success: true, message: 'Clave secreta detectada' });
}
