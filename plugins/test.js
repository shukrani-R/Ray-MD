"use strict";
const { ray } = require("../shukrani/ray");
const { conf } = require('../set');

ray(
  { nomCom: "plugins", reaction: "👊", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    console.log("Commande saisie !!!s");
    let z = "Hello I'm *✧RAY_MD✧* \n\n I'm a Whatsapp Bot Multi-Device";
    let d = " Made By *Shukrani Sir*";
    let varmess = z + d;
    var img = "https://files.catbox.moe/42b1sn.png";
    await zk.sendMessage(dest, { image: { url: img }, caption: varmess });
  }
);

ray(
  { nomCom: "ownerloc", reaction: "😊" },
  async (dest, zk, commandOptions) => {
    const { ms } = commandOptions;
    const ownerJid = "2557733XXXX@s.whatsapp.net"; // Hii imefichwa
    const ownerNumber = "+2557733XXXX"; // Hii pia imefichwa

    await zk.sendMessage(dest, { text: "Oh! Hi There" });
    await zk.sendMessage(dest, { text: "Oh! Hi There" }, { quoted: ms });
    await zk.sendMessage(dest, {
      text: "@user",
      mentions: [ownerJid]
    });

    await zk.sendMessage(dest, {
      location: { degreesLatitude: 24.121231, degreesLongitude: 55.1121221 }
    });

    const vcard =
      `BEGIN:VCARD\n` +
      `VERSION:3.0\n` +
      `FN:Fredie Sir\n` +
      `ORG:Ashoka Uni;\n` +
      `TEL;type=CELL;type=VOICE;waid=2557733XXXX:${ownerNumber}\n` +
      `END:VCARD`;

    await zk.sendMessage(dest, {
      contacts: {
        displayName: "Fredie",
        contacts: [{ vcard }]
      }
    });

    const buttons = [
      { buttonId: "id1", buttonText: { displayText: "Button 1" }, type: 1 },
      { buttonId: "id2", buttonText: { displayText: "Button 2" }, type: 1 },
      { buttonId: "id3", buttonText: { displayText: "Button 3" }, type: 1 }
    ];

    const buttonMessage = {
      text: "Hi it's button message",
      footer: "Hi There",
      buttons: buttons,
      headerType: 1
    };

    await zk.sendMessage(dest, buttonMessage);

    const templateButtons = [
      {
        index: 1,
        urlButton: {
          displayText: "⭐ Star Baileys on GitHub!",
          url: "https://github.com/adiwajshing/Baileys"
        }
      },
      {
        index: 2,
        callButton: {
          displayText: "Call me!",
          phoneNumber: ownerNumber
        }
      },
      {
        index: 3,
        quickReplyButton: {
          displayText: "This is a reply, just like normal buttons!",
          id: "id-like-buttons-message"
        }
      }
    ];

    const templateMessage = {
      text: "Hi it's a template message",
      footer: "Hi There",
      templateButtons: templateButtons
    };

    await zk.sendMessage(dest, templateMessage);

    const sections = [
      {
        title: "Section 1",
        rows: [
          { title: "Option 1", rowId: "option1" },
          {
            title: "Option 2",
            rowId: "option2",
            description: "This is a description"
          }
        ]
      },
      {
        title: "Section 2",
        rows: [
          { title: "Option 3", rowId: "option3" },
          {
            title: "Option 4",
            rowId: "option4",
            description: "This is a description Ray Md"
          }
        ]
      }
    ];

    const listMessage = {
      text: "This is a list",
      footer: "nice footer, link: https://google.com",
      title: "Amazing boldfaced list title",
      buttonText: "Required, text on the button to view the list",
      sections
    };

    await zk.sendMessage(dest, listMessage);
  }
);
