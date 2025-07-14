require('dotenv').config(); // Load .env variables
const express = require('express');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');

const app = express();

let qrCodeString = 'QR not generated yet';
let pairCodeText = 'Pairing code not ready';

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="text-align:center;font-family:sans-serif;margin-top:50px;">
        <h2>${process.env.BOT_NAME || 'Ray-MD'} Bot</h2>
        <p><strong>Pairing Code:</strong><br>${pairCodeText}</p>
        <p><strong>QR String:</strong><br>${qrCodeString}</p>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌍 Web Server running on port ${PORT}`));

// Retry counter (optional)
let reconnectAttempts = 0;
const MAX_RECONNECTS = 3;

// Start bot
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
      
      // Log reason once
      console.log(`❌ Connection closed. Reason: ${reason}`);

      if (reason === DisconnectReason.loggedOut) {
        console.log('🔐 Session logged out. Manual QR scan or reset required.');
        return;
      }

      if (reason === 500) {
        console.log('⚠️ WhatsApp server error (500). No automatic retry.');
        return;
      }

      if (reconnectAttempts < MAX_RECONNECTS) {
        reconnectAttempts++;
        console.log(`🔁 Attempting reconnect (${reconnectAttempts}/${MAX_RECONNECTS})...`);
        startRayMD();
      } else {
        console.log('🚫 Max reconnection attempts reached.');
      }
    }

    if (connection === 'open') {
      reconnectAttempts = 0; // Reset on successful connect
      console.log(`✅ Bot connected as ${process.env.OWNER_NUMBER || 'Unknown'}`);
    }
  });
}

startRayMD();
