const { ray } = require("../shukrani/ray");
const { downloadMediaMessage, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { exec } = require('child_process');
const { writeFile } = require("fs/promises");
const fs = require('fs-extra');
const moment = require("moment-timezone");


ray({
  nomCom: 'report',
  aliases: 'spread',
  desc: 'report anything to the bot developer',
  categorie: "new",
  reaction: '🍂'
}, async (bot, zk, context) => {
  const { arg, repondre, superUser, nomAuteurMessage } = context;

  if (!arg[0]) {
    return repondre("After the command *broadcast*, type your message to be sent to the specified contacts.");
  }

  if (!superUser) {
    return repondre("Only for the owner.");
  }

  // Specified contacts
  const contacts = [
    '255773350309@s.whatsapp.net',
    '255615184672@s.whatsapp.net',
    '255773350309@s.whatsapp.net'
  ];

  await repondre("*RAY-MD is sending your message to Developer contacts 🤦🤷*...");

  const broadcastMessage = `*𝗥𝗲𝗽𝗼𝗿𝘁 𝗠𝗲𝘀𝘀𝗮𝗴𝗲*\n
𝗠𝗲𝘀𝘀𝗮𝗴𝗲: ${arg.join(" ")}\n
𝗦𝗲𝗻𝗱𝗲𝗿 𝗡𝗮𝗺𝗲 : ${nomAuteurMessage}`;

  for (let contact of contacts) {
    await zk.sendMessage(contact, {
      image: { url: 'https://files.catbox.moe/42b1sn.png' },
      caption: broadcastMessage
    });
  }
});
