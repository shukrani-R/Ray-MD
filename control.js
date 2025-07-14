const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const P = require('pino');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: 'info' }),
    printQRInTerminal: false,
    auth: state,
    version
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    if (body.toLowerCase() === 'menu') {
      await sock.sendMessage(from, { text: '🤖 Ray-MD bot is active!' });
    }
  });

  console.log("🤖 Ray-MD Bot is running...");
}

startBot();
