// control.js require('dotenv').config(); const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys'); const { Boom } = require('@hapi/boom'); const P = require('pino'); const fs = require('fs'); const path = require('path'); const express = require('express'); const { cm } = require('./shukrani/ray');

const app = express(); let qrCodeString = 'QR not generated yet'; let pairCodeText = 'Pairing code not ready';

// Web dashboard app.get('/', (req, res) => { res.send(<html> <body style="text-align:center;font-family:sans-serif;margin-top:50px;"> <h2>${process.env.BOT_NAME || 'Ray-MD'} Bot</h2> <p><strong>Pairing Code:</strong><br>${pairCodeText}</p> <p><strong>QR String:</strong><br>${qrCodeString}</p> </body> </html>); });

const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(🌍 Web Server running on port ${PORT}));

// Load all plugins from plugins/ const pluginsDir = path.join(__dirname, 'plugins'); fs.readdirSync(pluginsDir).forEach(file => { if (file.endsWith('.js')) require(path.join(pluginsDir, file)); });

// Bot start function async function startRayMD() { const { state, saveCreds } = await useMultiFileAuthState('./session');

const sock = makeWASocket({ version: await fetchLatestBaileysVersion(), logger: P({ level: 'silent' }), printQRInTerminal: true, browser: [process.env.BOT_NAME || 'Ray-MD', 'Chrome', '1.0.0'], auth: state, });

sock.ev.on('creds.update', saveCreds);

sock.ev.on('connection.update', (update) => { const { connection, lastDisconnect, qr, pairingCode } = update;

if (qr) qrCodeString = qr;
if (pairingCode) pairCodeText = pairingCode;

if (connection === 'close') {
  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  console.log('❌ Connection closed. Reason:', reason);
  if (reason !== DisconnectReason.loggedOut) {
    setTimeout(startRayMD, 10000); // Retry after 10s
  } else {
    console.log('🔒 Logged out. Restart manually to generate new session.');
  }
}

if (connection === 'open') {
  console.log(`✅ Bot connected as ${process.env.OWNER_NUMBER || 'Unknown'}`);
}

});

sock.ev.on('messages.upsert', async ({ messages }) => { const m = messages[0]; if (!m.message || m.key.fromMe) return;

const text = m.message?.conversation || m.message?.extendedTextMessage?.text;
if (!text) return;

const body = text.toLowerCase().trim().split(' ')[0];

for (const cmd of cm) {
  const names = [cmd.nomCom, ...(cmd.aliases || [])];
  if (names.includes(body)) {
    await sock.sendMessage(m.key.remoteJid, { react: { text: cmd.reaction, key: m.key } });
    await cmd.fonction(sock, m, {
      repondre: (msg) => sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m })
    });
    return;
  }
}

}); }

startRayMD();

  
