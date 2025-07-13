const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load .env file
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // For hosted databases like Render
  }
});

// Baileys Auth Setup
const authFile = './session/creds.json';
const { state, saveState } = useSingleFileAuthState(authFile);

// Start socket
async function startRayMD() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
    browser: ['Ray-MD', 'Safari', '1.0']
  });

  // Save session
  sock.ev.on('creds.update', saveState);

  // Connection update
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting...', shouldReconnect);
      if (shouldReconnect) startRayMD();
    } else if (connection === 'open') {
      console.log('✅ Ray-MD Bot Connected Successfully!');
    }
  });

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    // Sample command
    if (text.toLowerCase() === "ping") {
      await sock.sendMessage(from, { text: "🏓 Pong! Ray-MD is alive!" });
    }

    // PostgreSQL usage example
    if (text.toLowerCase() === "dbtest") {
      try {
        const res = await pool.query('SELECT NOW()');
        await sock.sendMessage(from, { text: `📅 DB Time: ${res.rows[0].now}` });
      } catch (err) {
        await sock.sendMessage(from, { text: "❌ DB Error: " + err.message });
      }
    }
  });
}

// Run bot
startRayMD();

// Auto reload on file save (optional dev trick)
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`🔁 Updating '${__filename}'...`);
  delete require.cache[file];
  require(file);
});
