require('dotenv').config();
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

async function startRayMD() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const sock = makeWASocket({
    version: await fetchLatestBaileysVersion(),
    logger: P({ level: 'silent' }),
    printQRInTerminal: false, // Send QR to browser
    browser: [process.env.BOT_NAME || 'Ray-MD', 'Chrome', '1.0.0'],
    auth: state,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    console.log(update); // Log kila hatua ya connection

    const { connection, lastDisconnect, qr, pairingCode } = update;

    if (qr) qrCodeString = qr;
    if (pairingCode) pairCodeText = pairingCode;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('❌ Connection closed. Reason:', reason);

      // Usijaribu ku-reconnect kwa error ya 500 au loggedOut
      if (reason !== DisconnectReason.loggedOut && reason !== 500) {
        startRayMD();
      } else {
        console.log('⚠️ WhatsApp server error (500) or logged out. No automatic retry.');
      }
    }

    if (connection === 'open') {
      console.log(`✅ Bot connected as ${process.env.OWNER_NUMBER || 'Unknown'}`);
    }
  });
}

startRayMD();
