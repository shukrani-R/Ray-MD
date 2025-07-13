const express = require('express');
const makeWASocket = require('@adiwajshing/baileys').default;
const { useSingleFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

const authFile = './session/creds.json';
const { state, saveState } = useSingleFileAuthState(authFile);

const app = express();
let qrCodeString = 'QR not generated yet';
let pairCodeText = 'Pairing code not ready';
let sock = null;

// Express route to display QR or Pairing code
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Ray-MD Bot QR</title></head>
      <body style="font-family:sans-serif;text-align:center;margin-top:5em;">
        <h2>🤖 Ray-MD WhatsApp Bot</h2>
        <p>Use QR Code or Pair Code to login.</p>
        <pre><strong>Pairing Code:</strong><br>${pairCodeText}</pre>
        <pre><strong>QR Code String:</strong><br>${qrCodeString}</pre>
      </body>
    </html>
  `);
});

// Start Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web UI running at http://localhost:${PORT}`);
});

// WhatsApp bot logic
async function startRayMD() {
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['Ray-MD', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr, pairingCode } = update;

    if (qr) {
      qrCodeString = qr;
      console.log('📷 QR Code:', qr);
    }

    if (pairingCode) {
      pairCodeText = pairingCode;
      console.log('🔗 Pairing Code:', pairingCode);
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('❌ Connection closed. Reason:', reason);
      if (reason !== 401) startRayMD();
    }

    if (connection === 'open') {
      console.log('✅ Bot connected successfully!');
    }
  });
}

startRayMD();
