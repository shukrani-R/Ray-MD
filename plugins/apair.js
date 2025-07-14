const { ray } = require("../shukrani/ray");
const axios = require("axios");

ray({
  nomCom: "pair",
  aliases: ["session", "pair", "paircode", "qrcode"],
  reaction: '🤝',
  categorie: "General"
}, async (sock, m, { repondre, arg }) => {
  try {
    if (!arg || arg.length === 0) {
      return repondre("⚠️ *Usage:* `pair 2557xxxxxxx`\nExample: `pair 25575259xxxx`");
    }

    const number = encodeURIComponent(arg.join(" "));
    const url = `https://fredietech.onrender.com/code?number=${number}`;

    await repondre("⏳ *Please wait... Generating your pair code*");

    const response = await axios.get(url);
    const data = response.data;

    if (data && data.code) {
      await repondre(`✅ *Here is your pair code:*\n\`\`\`${data.code}\`\`\``);
      await repondre("📌 *Copy & paste the code into WhatsApp's link device page above.*");
    } else {
      throw new Error("No code received from API.");
    }

  } catch (error) {
    console.error("❌ Pair code error:", error.message);
    return repondre("❌ *Failed to generate pair code. Please try again later.*");
  }
});
