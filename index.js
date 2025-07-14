global.crypto = require('crypto'); // ✅ FIX for Render Node.js

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const express = require('express');
const qrcode = require('qrcode');
const P = require('pino');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Ray-MD Pairing Server. Tumia /qr au /pair?phone=2557XXXXXXX");
});

app.get("/qr", async (req, res) => {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    version
  });

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection } = update;
    if (qr) {
      const qrImage = await qrcode.toDataURL(qr);
      res.send(`<h2>📱 Scan this QR</h2><img src="${qrImage}" /><p>on your WhatsApp to login</p>`);
    }
    if (connection === "open") {
      await saveCreds();
      console.log("✅ Connected via QR!");
    }
  });
});

app.get("/pair", async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.send("⚠️ Add phone: /pair?phone=2557XXXXXXX");

  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state,
    version,
    printQRInTerminal: false
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, pairingCode } = update;
    if (pairingCode) {
      res.send(`<h2>🤝 Pairing Code:</h2><p><b>${pairingCode}</b></p><p>Use it on your phone number: ${phone}@s.whatsapp.net</p>`);
    }
    if (connection === 'open') {
      await saveCreds();
      console.log("✅ Connected via Pair Code!");
    }
  });

  await sock.requestPairingCode(phone);
});

app.listen(PORT, () => {
  console.log(`🟢 Pairing server running at http://localhost:${PORT}`);
});
