const axios = require("axios");
const conf = require(__dirname + "/../../set");
const { ray } = require("../shukrani/ray");

// API Key & Base URL
const apiKey = '7b6507c792f74a2b9db41cfc8fd8cf05';
const apiUrl = 'https://api.football-data.org/v4';

// Helper function to fetch data from Football API
const fetchFootballData = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: { 'X-Auth-Token': apiKey }
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// ✅ Command: live <team name>
ray({
  nomCom: "live",
  categorie: "football live",
  reaction: "📡"
}, async (dest, zk, commandOptions) => {
  const { repondre, arg } = commandOptions;
  const teamName = arg.join(" ").toLowerCase();

  if (!teamName) {
    return repondre("⚠️ Please enter a team name. Example: `live barcelona`");
  }

  const liveMatchesUrl = `${apiUrl}/matches?status=LIVE`;
  const data = await fetchFootballData(liveMatchesUrl);

  if (!data || !data.matches || data.matches.length === 0) {
    return repondre("🚫 No live matches are currently in progress.");
  }

  const foundMatches = data.matches.filter(match => {
    const home = match.homeTeam.name.toLowerCase();
    const away = match.awayTeam.name.toLowerCase();
    return home.includes(teamName) || away.includes(teamName);
  });

  if (foundMatches.length === 0) {
    return repondre(`🚫 No live match found for team name "${teamName}".`);
  }

  let msg = `🎙️ *LIVE Score for "${teamName}"*\n\n`;

  foundMatches.forEach(match => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const score = match.score.fullTime;
    const minute = match.minute || "In progress";

    msg += `⚽ ${home} ${score.home ?? 0} - ${score.away ?? 0} ${away}\n🕒 ${minute}'\n\n`;
  });

  repondre(msg);
});
