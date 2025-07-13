require('dotenv').config(); // 👈 load .env variables
const express = require('express');
const makeWASocket = require('@adiwajshing/baileys').default;
const { useSingleFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');

const authFile = './session/creds.json';
const { state, saveState } = useSingleFileAuthState(authFile);

const app = express();

let qrCodeString = 'QR not generated yet';
let pairCodeText = 'Pairing code not ready';

// Serve QR or Pair Code
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
app.listen(PORT, () => console.log(`🌍 Listening on port ${PORT}`));

// Bot logic
async function startRayMD() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: [process.env.BOT_NAME || 'Ray-MD', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr, pairingCode } = update;

    if (qr) qrCodeString = qr;
    if (pairingCode) pairCodeText = pairingCode;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('❌ Connection closed. Reason:', reason);
      if (reason !== 401) startRayMD();
    }

    if (connection === 'open') {
      console.log(`✅ Bot connected as ${process.env.OWNER_NUMBER}`);
    }
  });
}

startRayMD();
