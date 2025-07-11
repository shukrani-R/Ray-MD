const axios = require("axios");
const { ray } = require(__dirname + "/../shukrani/ray");
const s = require(__dirname + "/../set");

ray({
  nomCom: "bible",
  categorie: "God-first",
  reaction: "📖"
}, async (dest, zk, commandOptions) => {
  const { repondre, arg, msg } = commandOptions;
  const inputText = arg.join(" ");

  if (!inputText || !inputText.includes(":")) {
    return repondre(`⚠️ Please enter book name and verse. Example: *biblemathayo 3:16* or *bibleyohana 1:1-5*`);
  }

  const commandBody = msg.body.trim().toLowerCase().replace("bible", "");
  const parts = commandBody.match(/^([a-z]+)\s?(\d+:\d+(-\d+)?)$/i);

  if (!parts) {
    return repondre("❌ Invalid format. Try: *biblemathayo 3:16* or *bibleyohana 1:1-5*");
  }

  const bookName = parts[1];
  const reference = parts[2];

  // Mapping of Swahili book names to API English names
  const bookMap = {
    mwanzo: "Genesis",
    kutoka: "Exodus",
    walawi: "Leviticus",
    hesabu: "Numbers",
    torati: "Deuteronomy",
    yoshua: "Joshua",
    waamuzi: "Judges",
    ruth: "Ruth",
    samweli1: "1 Samuel",
    samweli2: "2 Samuel",
    wafalme1: "1 Kings",
    wafalme2: "2 Kings",
    nyakati1: "1 Chronicles",
    nyakati2: "2 Chronicles",
    ezra: "Ezra",
    nehemia: "Nehemiah",
    esta: "Esther",
    ayubu: "Job",
    zaburi: "Psalms",
    mithali: "Proverbs",
    mhubiri: "Ecclesiastes",
    wimbo: "Song of Solomon",
    isaya: "Isaiah",
    yeremia: "Jeremiah",
    maombolezo: "Lamentations",
    ezekieli: "Ezekiel",
    daniel: "Daniel",
    hsea: "Hosea",
    yoeli: "Joel",
    amosi: "Amos",
    obadia: "Obadiah",
    yona: "Jonah",
    mika: "Micah",
    nahumu: "Nahum",
    habakuki: "Habakkuk",
    sefania: "Zephaniah",
    hagai: "Haggai",
    zakaria: "Zechariah",
    malaki: "Malachi",
    mathayo: "Matthew",
    marko: "Mark",
    luka: "Luke",
    yohana: "John",
    matendo: "Acts",
    warumi: "Romans",
    wakorintho1: "1 Corinthians",
    wakorintho2: "2 Corinthians",
    wagalatia: "Galatians",
    waefeso: "Ephesians",
    wafilipi: "Philippians",
    wakolosai: "Colossians",
    wathesalonike1: "1 Thessalonians",
    wathesalonike2: "2 Thessalonians",
    timotheo1: "1 Timothy",
    timotheo2: "2 Timothy",
    tito: "Titus",
    filemoni: "Philemon",
    waebrania: "Hebrews",
    yakobo: "James",
    petero1: "1 Peter",
    petero2: "2 Peter",
    yohana1: "1 John",
    yohana2: "2 John",
    yohana3: "3 John",
    yuda: "Jude",
    ufunuo: "Revelation"
  };

  const englishBook = bookMap[bookName];
  if (!englishBook) {
    return repondre(`⚠️ Sorry, the book name "${bookName}" is not recognized. Please check the spelling.`);
  }

  const apiUrl = `https://bible-api.com/${englishBook}%20${reference}?translation=sw`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.text) {
      return repondre("❌ No verse found.");
    }

    const verseText = data.text.trim();
    const verseRef = data.reference;

    const finalMessage = `📖 *${verseRef}*\n\n${verseText}\n\n_🙏 Powered by RAY MD & SHUKRANI_`;

    await repondre(finalMessage);

  } catch (err) {
    console.error(err);
    repondre("🥵 Failed to fetch verse. Please try again later.");
  }
});
