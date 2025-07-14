require('dotenv').config();
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');

const app = express();

let qrCodeString = 'QR not generated yet';
let pairCodeText = 'Pairing code not ready';

// Web interface
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
  const { version } = await fetchLatestBaileysVersion(); // ✅ FIX: extract only the version array

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }), // silent mode
    printQRInTerminal: false, // don't spam terminal
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
      if (reason !== DisconnectReason.loggedOut) {
        console.log(`❌ Connection closed. Reason: ${reason}`);
        // avoid reconnecting forever if WhatsApp server errors
        if (reason !== 500) startRayMD();
        else console.log("⚠️ WhatsApp server error (500) or logged out. No automatic retry.");
      }
    }

    if (connection === 'open') {
      console.log(`✅ Bot connected as ${process.env.OWNER_NUMBER || 'Unknown'}`);
    }
  });

  const fs = require('fs');
const path = require('path');
const { cm } = require('./shukrani/ray');

// Auto-load commands from plugins/
const pluginsPath = path.join(__dirname, 'plugins');
fs.readdirSync(pluginsPath).forEach(file => {
  if (file.endsWith('.js')) {
    require(path.join(pluginsPath, file));
  }
});

// Sample usage: check for command in incoming message
async function handleCommand(sock, m) {
  const body = m.body?.toLowerCase()?.trim();

  for (const cmd of cm) {
    const names = [cmd.nomCom, ...(cmd.aliases || [])];
    if (names.includes(body)) {
      await sock.sendMessage(m.key.remoteJid, { react: { text: cmd.reaction, key: m.key } });
      await cmd.fonction(sock, m, { repondre: (msg) => sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m }) });
      return;
    }
  }
}

startRayMD();
