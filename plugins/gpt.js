const { ray } = require("../shukrani/ray");
const ai = require('unlimited-ai');
const conf = require(__dirname + "/../set");

ray({
  nomCom: "gpt",
  aliases: ["ai", "chatai", "chat"],
  reaction: "🤖",
  categorie: "AI"
}, async (dest, zk, commandOptions) => {
  const { repondre, arg } = commandOptions;
  const prompt = arg.join(" ").trim();

  if (!prompt) {
    return repondre("⚠️ Please enter your question. Example: gpt What is water?");
  }

  try {
    const model = 'gpt-4-turbo-2024-04-09';
    const messages = [
      { role: 'user', content: prompt },
      { role: 'system', content: 'You are a helpful assistant on WhatsApp. You respond only in Swahili. Keep answers polite, respectful, and concise.' }
    ];

    const response = await ai.generate(model, messages);

    await zk.sendMessage(dest, {
      text: response,
      contextInfo: {
        externalAdReply: {
          title: conf.BOT,
          body: "Powered by SHUKRANI AI",
          thumbnailUrl: conf.URL,
          sourceUrl: "https://whatsapp.com/channel/0029VaihcQv84Om8LP59fO3f",
          mediaType: 1,
          showAdAttribution: true,
        },
      },
    });

  } catch (err) {
    console.error("❌ AI Error:", err);
    return repondre("😓 Sorry, I couldn’t process your request at the moment.");
  }
});
