const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const P = require('pino');
const fs = require('fs');
require('dotenv').config();
const { Pool } = require('pg');

// DB connect
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Auth state
const startRayMD = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
    browser: ['Ray-MD', 'Chrome', '1.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('🛑 Connection closed.', shouldReconnect ? 'Reconnecting...' : 'Logged out');
      if (shouldReconnect) startRayMD();
    } else if (connection === 'open') {
      console.log('✅ Ray-MD Bot Connected Successfully!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (text.toLowerCase() === "ping") {
      await sock.sendMessage(from, { text: "🏓 Pong! Ray-MD is alive!" });
    }

    if (text.toLowerCase() === "dbtest") {
      try {
        const res = await pool.query('SELECT NOW()');
        await sock.sendMessage(from, { text: `📅 DB Time: ${res.rows[0].now}` });
      } catch (err) {
        await sock.sendMessage(from, { text: "❌ DB Error: " + err.message });
      }
    }
  });
};

startRayMD();
