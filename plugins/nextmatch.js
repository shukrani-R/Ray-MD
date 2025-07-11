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
  nomCom: "nextmatch",
  categorie: "football live",
  reaction: "📅"
}, async (dest, zk, commandOptions) => {
  const { repondre, msg } = commandOptions;
  const commandText = msg.body.toLowerCase();

  const leagueName = Object.keys(leagueCodes).find(key => commandText.includes(key));
  if (!leagueName) {
    return repondre("⚠️ Unknown league. Example: laliganextmatch, bundesliganextmatch");
  }

  const code = leagueCodes[leagueName];
  const url = `${apiUrl}/competitions/${code}/matches?status=SCHEDULED`;

  const data = await fetchFootballData(url);
  if (!data || !data.matches || data.matches.length === 0) {
    return repondre("❌ Couldn't fetch upcoming matches.");
  }

  const upcoming = data.matches.slice(0, 10);
  let msgText = `📅 *Upcoming Matches - ${leagueName.toUpperCase()}*\n\n`;

  upcoming.forEach(match => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const date = new Date(match.utcDate);
    const formatted = date.toLocaleString('en-GB', { timeZone: 'UTC' });

    msgText += `⚽ ${home} vs ${away}\n🗓️ ${formatted}\n\n`;
  });

  repondre(msgText);
});
