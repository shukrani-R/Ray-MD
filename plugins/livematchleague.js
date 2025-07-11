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
  nomCom: "livematchleague",
  categorie: "football live",
  reaction: "🔴"
}, async (dest, zk, commandOptions) => {
  const { repondre, msg } = commandOptions;
  const text = msg.body.toLowerCase();

  const leagueKey = Object.keys(leagueCodes).find(key => text.includes(key));
  if (!leagueKey) {
    return repondre("⚠️ Unknown league. Example: livematchlaliga, livematchbundesliga");
  }

  const leagueCode = leagueCodes[leagueKey];
  const url = `${apiUrl}/matches?status=LIVE`;

  const data = await fetchFootballData(url);
  if (!data || !data.matches || data.matches.length === 0) {
    return repondre("🚫 No live matches currently.");
  }

  const leagueMatches = data.matches.filter(match => match.competition.code === leagueCode);

  if (leagueMatches.length === 0) {
    return repondre(`🚫 No live matches currently in ${leagueKey.toUpperCase()}.`);
  }

  let message = `🔴 *Live Matches - ${leagueKey.toUpperCase()}*\n\n`;

  leagueMatches.forEach(match => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const score = match.score.fullTime;
    const minute = match.minute || "Live";

    message += `⚽ ${home} ${score.home ?? 0} - ${score.away ?? 0} ${away}  🕒 ${minute}'\n`;
  });

  repondre(message);
});
