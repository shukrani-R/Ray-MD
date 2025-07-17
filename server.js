const express = require('express');
const QRCode = require('qrcode');
const app = express();
const fs = require('fs');
const path = require('path');

// Path ya faili ya QR ambayo Baileys anaandika (ya muda mfupi)
const QR_PATH = path.join(__dirname, 'auth/qr.txt');

app.get('/qr', async (req, res) => {
  const username = req.query.user || '👋 Karibu!';
  
  if (!fs.existsSync(QR_PATH)) {
    return res.status(503).send('⏳ QR code haijapatikana bado. Tafadhali subiri...');
  }

  const qrString = fs.readFileSync(QR_PATH, 'utf-8').trim();

  try {
    const qrImage = await QRCode.toDataURL(qrString);
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WhatsApp Pairing QR</title>
          <style>
            body { font-family: sans-serif; text-align: center; background: #f4f4f4; padding-top: 40px; }
            h1 { font-size: 22px; color: #333; }
            img { margin-top: 20px; border: 6px solid #ccc; border-radius: 10px; }
          </style>
        </head>
        <body>
          <h1>${username}, scan QR kuunganisha na WhatsApp</h1>
          <img src="${qrImage}" alt="WhatsApp QR Code" />
          <p style="margin-top: 20px; color: #888;">QR code hubadilika kila sekunde chache. Hakikisha unascann kwa haraka.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("QR Error:", err);
    return res.status(500).send('🚫 Hitilafu katika kutengeneza QR');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ QR server running on port ${PORT}`));
