require('dotenv').config(); // Load env
const express = require('express');
const { Pool } = require('pg'); // PostgreSQL
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');

const app = express();

let qrCodeString = 'QR not generated yet';
let pairCodeText = 'Pairing code not ready';

// Initialize PostgreSQL
let dbConnected = false;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
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

// Web interface for QR/pair
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="text-align:center;font-family:sans-serif;margin-top:50px;">
        <h2>${process.env.BOT_NAME || 'Ray-MD'} Bot</h2>
        <p><strong>Pairing Code:</strong><br>${pairCodeText}</p>
        <p><strong>QR String:</strong><br>${qrCodeString}</p>
        <p style="margin-top:20px;color:gray">${dbConnected ? '🟢 DB Connected' : '🔴 DB Not Connected'}</p>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌍 Web Server running on port ${PORT}`));

// Start WhatsApp bot
async function startRayMD() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const sock = makeWASocket({
    version: await fetchLatestBaileysVersion(),
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
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
        startRayMD(); // Retry connection
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
