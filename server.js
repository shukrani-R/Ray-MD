require('dotenv').config();
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const app = express();
const QR_PATH = path.join(__dirname, 'auth/qr.txt');
const PAIR_PATH = path.join(__dirname, 'auth/paircode.txt');

// Serve QR as HTML
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
          <h1>${username}, scan QR kuunganisha WhatsApp</h1>
          <img src="${qrImage}" alt="QR Code" />
          <p style="margin-top: 20px; color: #888;">QR hubadilika kila sekunde chache. Hakikisha unascann haraka.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("QR Error:", err);
    return res.status(500).send('🚫 Hitilafu katika kutengeneza QR');
  }
});

// Serve Pair Code
app.get('/paircode', (req, res) => {
  if (!fs.existsSync(PAIR_PATH)) {
    return res.status(503).send('⏳ Pair code haijapatikana bado.');
  }

  const pairCode = fs.readFileSync(PAIR_PATH, 'utf-8').trim();
  return res.send(`<h2 style="font-family:sans-serif;text-align:center;margin-top:50px;">🔢 Pair Code: ${pairCode}</h2>`);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌍 Pairing Server running on port ${PORT}`));
