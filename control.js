require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, usePairingCode, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HTML form ya kuingiza namba
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="text-align:center;font-family:sans-serif;margin-top:50px;">
        <h2>🤖 SHUKRANI-MD PAIRING</h2>
        <form action="/generate" method="POST">
          <input name="phone" placeholder="Ingiza namba yako ya WhatsApp (mfano: 255712345678)" required style="padding:10px; font-size:16px; width:300px;" />
          <br/><br/>
          <button type="submit" style="padding:10px 20px; font-size:16px;">🔄 Generate Pairing Code</button>
        </form>
      </body>
    </html>
  `);
});

// Kipokea namba na kutoa pairing code
app.post('/generate', async (req, res) => {
  const phone = req.body.phone;

  if (!phone || !phone.startsWith('2')) {
    return res.send("❌ Tafadhali weka namba sahihi ya kimataifa (mfano: 2557xxxxxxx)");
  }

  const sessionPath = path.join(__dirname, 'sessions', phone);
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
      version: await fetchLatestBaileysVersion(),
      logger: P({ level: 'silent' }),
      auth: state,
      printQRInTerminal: false,
      browser: ['SHUKRANI', 'Chrome', '1.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    const pairingCode = await usePairingCode(sock, phone);

    res.send(`
      <html>
        <body style="text-align:center;font-family:sans-serif;margin-top:50px;">
          <h2>✅ Pairing Code ya ${phone}</h2>
          <div style="font-size:2em; font-weight:bold; color:green;">${pairingCode}</div>
          <p>👉 Nenda WhatsApp > Linked Devices > Link with code</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Error:", err);
    res.send("🚫 Hitilafu wakati wa kutengeneza pairing code. Jaribu tena.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
