require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, usePairingCode, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const P = require('pino');

// Initialize the app
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Paths for storing pairing code and QR
const QR_PATH = path.join(__dirname, 'auth', 'qr.txt');
const PAIR_PATH = path.join(__dirname, 'auth', 'paircode.txt');

// Display the HTML form for entering a phone number
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

// Handle phone number input and generate pairing code
app.post('/generate', async (req, res) => {
  const phone = req.body.phone;

  // Validate phone number
  if (!phone || !phone.startsWith('255')) {
    return res.send("❌ Tafadhali weka namba sahihi ya kimataifa (mfano: 2557xxxxxxx)");
  }

  const sessionPath = path.join(__dirname, 'sessions', phone);
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

  try {
    // Set up WhatsApp session with Baileys
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
      version: await fetchLatestBaileysVersion(),
      logger: P({ level: 'silent' }),
      auth: state,
      printQRInTerminal: false,
      browser: ['SHUKRANI', 'Chrome', '1.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    // Generate pairing code
    const pairingCode = await usePairingCode(sock, phone);

    // Save pairing code to file
    fs.writeFileSync(PAIR_PATH, pairingCode);
    
    // Respond with generated pairing code
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

// Display the QR code
app.get('/qr', async (req, res) => {
  try {
    if (!fs.existsSync(QR_PATH)) {
      return res.status(503).send('⏳ QR code haijapatikana bado. Tafadhali subiri...');
    }
    
    const qrCode = fs.readFileSync(QR_PATH, 'utf-8').trim();
    res.setHeader('Content-Type', 'image/png');
    res.end(await QRCode.toBuffer(qrCode));
  } catch (err) {
    console.error("❌ QR error:", err);
    res.status(500).send('🚫 Hitilafu katika kutengeneza QR');
  }
});

// Keep alive the server with periodic fetch
setInterval(() => {
  try {
    fetch(`https://${process.env.RENDER_EXTERNAL_URL || 'yourrender.onrender.com'}/`).catch(() => {});
  } catch (err) {
    console.warn("⚠️ Keep-alive fetch failed:", err.message);
  }
}, 1000 * 60 * 5);

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
