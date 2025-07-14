require('dotenv').config(); // Load .env variables
const express = require('express');
const P = require('pino');
const { Boom } = require('@hapi/boom');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@adiwajshing/baileys');

const app = express();
let qrCodeString = 'QR not generated yet';
let pairCodeText = 'Pairing code not ready';

// Web interface
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="text-align:center;font-family:sans-serif;margin-top:50px;">
        <h2>${process.env.BOT_NAME || 'SHUKRANI'} Bot</h2>
        <p><strong>Pairing Code:</strong><br>${pairCodeText}</p>
        <p><strong>QR String:</strong><br>${qrCodeString}</p>
      </body>
    </html>
  `);
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌍 Web Server running on port ${PORT}`));

// Start bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const sock = makeWASocket({
    version: await fetchLatestBaileysVersion(),
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: [process.env.BOT_NAME || 'SHUKRANI', 'Chrome', '1.0.0'],
    auth: state
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr, pairingCode } = update;

    if (qr) qrCodeString = qr;
    if (pairingCode) pairCodeText = pairingCode;

    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;

      console.log(`❌ Connection closed. Reason: ${code}`);

      if (code === DisconnectReason.loggedOut) {
        console.log('🛑 Logged out from WhatsApp Web. Please re-scan.');
      } else if (code === 500) {
        console.log('⚠️ WhatsApp server error (500) or logged out. No automatic retry.');
        // optional: delay or manual restart
      } else {
        console.log('🔁 Trying to reconnect...');
        startBot(); // safe retry
      }
    }

    if (connection === 'open') {
      console.log(`✅ Bot connected as ${process.env.OWNER_NUMBER || 'Unknown Owner'}`);
    }
  });

  // You can extend here: plugins loader, events, commands etc.
}

startBot();
