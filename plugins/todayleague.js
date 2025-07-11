const axios = require("axios");
const conf = require(__dirname + "/../set");
const { ray } = require(__dirname + "/../shukrani/ray");

const apiKey = '7b6507c792f74a2b9db41cfc8fd8cf05';
const apiUrl = 'https://api.football-data.org/v4';

const leagueCodes = {
  laliga: "PD",
  bundesliga: "BL1",
  ligue1: "FL1",
  seriea: "SA",
  premierleague: "PL",
  ligaportugal: "PPL",
  champions: "CL"
};

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

ray({
  nomCom: "todayleague",
  categorie: "football live",
  reaction: "📆"
}, async (dest, zk, commandOptions) => {
  const { repondre, msg } = commandOptions;
  const text = msg.body.toLowerCase();

  const leagueKey = Object.keys(leagueCodes).find(key => text.includes(key));
  if (!leagueKey) {
    return repondre("⚠️ Unknown league. Example: todaymatchlaliga, todaymatchbundesliga");
  }

  const leagueCode = leagueCodes[leagueKey];
  const today = new Date().toISOString().slice(0, 10);
  const url = `${apiUrl}/competitions/${leagueCode}/matches?dateFrom=${today}&dateTo=${today}`;

  const data = await fetchFootballData(url);
  if (!data || !data.matches || data.matches.length === 0) {
    return repondre(`🚫 No ${leagueKey.toUpperCase()} matches scheduled for today.`);
  }

  let message = `📆 *Today's ${leagueKey.toUpperCase()} Matches (${today})*\n\n`;

  data.matches.forEach(match => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const time = new Date(match.utcDate).toLocaleTimeString('en-GB', { timeZone: 'UTC' });

    message += `⚽ ${home} vs ${away} - 🕒 ${time} UTC\n`;
  });

  repondre(message);
});
