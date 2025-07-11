const axios = require("axios");
const { ray } = require("../shukrani/ray");
const conf = require("../set");

ray({
  nomCom: "quran",
  aliases: ["aya", "verse", "surah"],
  reaction: "🕌",
  categorie: "God-first"
}, async (dest, sock, commandOptions) => {
  const { repondre, arg, msg } = commandOptions;
  const input = arg.join(" ").trim();

  if (!input) {
    return repondre("⚠️ Please provide a surah or surah:ayah. Example: *quran 2:255* or *quran 36*");
  }

  let apiUrl;
  let isSingleVerse = false;

  if (input.includes(":")) {
    const [surah, verse] = input.split(":").map(x => x.trim());
    apiUrl = `https://api.alquran.cloud/v1/ayah/${surah}:${verse}/sw`;
    isSingleVerse = true;
  } else {
    apiUrl = `https://api.alquran.cloud/v1/surah/${input}/sw`;
  }

  try {
    const response = await axios.get(apiUrl);

    if (response.data.status !== "OK") {
      return repondre("❌ Invalid surah or ayah. Please check your input.");
    }

    if (isSingleVerse) {
      const data = response.data.data;
      const message = `📖 *Surah ${data.surah.englishName} - Ayah ${data.numberInSurah}*\n\n${data.text}\n\n_🤲 Kiswahili translation from AlQuran.cloud_`;
      return await sock.sendMessage(dest, { text: message }, { quoted: msg });
    } else {
      const surah = response.data.data;
      let message = `📖 *Surah ${surah.englishName} (${surah.name})* - ${surah.numberOfAyahs} ayahs\n\n`;

      surah.ayahs.forEach(aya => {
        message += `🔹 ${aya.numberInSurah}. ${aya.text}\n`;
      });

      message += `\n_🤲 Kiswahili translation from AlQuran.cloud_`;
      return await sock.sendMessage(dest, { text: message }, { quoted: msg });
    }
  } catch (err) {
    console.error("❌ Error fetching Quran:", err.message);
    return repondre("🥺 Failed to retrieve surah/ayah. Please try again later.");
  }
});
