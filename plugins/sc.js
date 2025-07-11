const util = require('util');
const fs = require('fs-extra');
const { ray } = require(__dirname + "/../shukrani/ray");
const { format } = require(__dirname + "/../shukrani/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)

ray({ nomCom: "sc", categorie: "My Contact" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre ,prefixe,nomAuteurMessage,mybotpic} = commandeOptions;
    let { cm } = require(__dirname + "/../shukrani//ray");
    var coms = {};
    var mode = "public";
    
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }


    

    cm.map(async (com, index) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault('Etc/GMT');

// Créer une date et une heure en GMT
const temps = moment().format('HH:mm:ss');
const date = moment().format('DD/MM/YYYY');

  let infoMsg =  `
❂━━━════──⊷──════━━━❂
   *INFORMATION ABOUT ME* 
▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒
❂━━━➳════⊷════➳━━━━❂

*GITHUB LINK*
> https://github.com/shukrani-R

*WHATSAPP GROUP*
> https://chat.whatsapp.com/JsfyU85BsCZ9nYDF2xig2u?mode=r_c

*FOR DEVELOPER T.ME*
> https://t.me/ray

*WHATSAPP CHANNEL*
> https://whatsapp.com/channel/0029VbB16dt9hXEyw3bO1k0p

*FOR MORE INFO TAP ON THE LINK BELOW*
> https://github.com/shukrani-R/Ray-MD
╭──━━━━═════════━━━━⦿
┃ ❂━━━════➳════━━━━❂
┃▓▒⁠⁠⁠⁠ *RAM* : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃▓▒ *DEV* : *RAY BOT*
┃ ❂━━━════➳════━━━━❂
⁠⁠⁠⁠╰──━━━━═════════━━━━⦿ 
  `;
    
let menuMsg = `
     ╭──━━━━══⊷══━━━━⦿
     ┃ ❂━━━━━━━━━━━━❂
     ┃▓ RAY MD
     ┃ ❂━━━━━━━━━━━━❂
     ╰──━━━━══⊷══━━━━⦿
❂━━━━═════⊷═════━━━━❂
▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒
❂━━━════──➳──════━━━❂`;

   var lien = mybotpic();

   if (lien.match(/\.(mp4|gif)$/i)) {
    try {
        zk.sendMessage(dest, { video: { url: lien }, caption:infoMsg + menuMsg, footer: "I am *Ray Md*, Developed By shukraniray Sir" , gifPlayback : true }, { quoted: ms });
    }
    catch (e) {
        console.log("🥵🥵 Menu erreur " + e);
        repondre("🥵🥵 Menu erreur " + e);
    }
} 
// Vérification pour .jpeg ou .png
else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
    try {
        zk.sendMessage(dest, { image: { url: lien }, caption:infoMsg + menuMsg, footer: "I am *RAY MD V7*, Developed By Fredie Sir" }, { quoted: ms });
    }
    catch (e) {
        console.log("🥵🥵 Menu erreur " + e);
        repondre("🥵🥵 Menu erreur " + e);
    }
} 
else {
    
    repondre(infoMsg + menuMsg);
    
}

});
