require('dotenv').config(); // Load env
const express = require('express');
const { Pool } = require('pg'); // PostgreSQL
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const { toBuffer } = require('qrcode');
const fetch = require('node-fetch');

const app = express();

let qrCodeString = 'QR not generated yet';
let pairCodeText = 'Pairing code not ready';

// Initialize PostgreSQL
let dbConnected = false;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
pool.connect()
  .then(() => {
    dbConnected = true;
    console.log("✅ PostgreSQL connected");
  })
  .catch(err => {
    console.error("❌ PostgreSQL error:", err.message);
  });

// ======================
// 🌐 Web Routes
// ======================

// Main page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="text-align:center;font-family:sans-serif;margin-top:50px;">
        <h2>${process.env.BOT_NAME || 'Ray-MD'} Bot</h2>
        <div>
          <h3>📸 QR Code</h3>
          <img src="/qr" width="250" height="250" />
        </div>
        <div style="margin-top:30px;">
          <h3>🔢 Pairing Code</h3>
          <p style="font-size:1.5em;">${pairCodeText}</p>
        </div>
        <p style="margin-top:30px;color:gray;">${dbConnected ? '🟢 DB Connected' : '🔴 DB Not Connected'}</p>
      </body>
    </html>
  `);
});

// QR Code as PNG
app.get('/qr', async (req, res) => {
  if (!qrCodeString || qrCodeString === 'QR not generated yet') {
    return res.status(503).send('QR code not available yet');
  }
  res.setHeader('Content-Type', 'image/png');
  res.end(await toBuffer(qrCodeString));
});

// Pairing code as JSON (optional)
app.get('/paircode', (req, res) => {
  res.json({ pairCode: pairCodeText });
});

// KeepAlive (optional for platforms like Render)
setInterval(() => {
  fetch(`https://${process.env.RENDER_EXTERNAL_URL || 'yourrender.onrender.com'}/`).catch(() => {});
}, 1000 * 60 * 5); // Every 5 minutes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌍 Web Server running on port ${PORT}`));

// ======================
// 🤖 Start WhatsApp Bot
// ======================
async function startRayMD() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const sock = makeWASocket({
    version: await fetchLatestBaileysVersion(),
    logger: P({ level: 'silent' }),
    printQRInTerminal: false, // QR itatoka kwa browser, si terminal
    browser: [process.env.BOT_NAME || 'Ray-MD', 'Chrome', '1.0.0'],
    auth: state,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr, pairingCode } = update;

    if (qr) qrCodeString = qr;
    if (pairingCode) pairCodeText = pairingCode;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('❌ Connection closed. Reason:', reason);
      if (reason !== DisconnectReason.loggedOut && reason !== 500) {
        startRayMD(); // Retry
      } else {
        console.log("⚠️ Not retrying due to critical disconnect");
      }
    }

    if (connection === 'open') {
      console.log(`✅ Bot connected as ${process.env.OWNER_NUMBER || 'Unknown'}`);
    }
  });
}

startRayMD();
