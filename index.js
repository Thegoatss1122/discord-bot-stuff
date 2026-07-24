const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");

const fs = require("fs"); 
const path = require("path");
const axios = require("axios");
const config = require("./token.js");

const token = config.DISCORD_TOKEN;
const CLIENT_ID = "1441541093156982975";
const GUILD_ID = "1385650154832662688";

if (!token) {
  console.error("❌ Missing token");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message]
});

const rand = arr => arr[Math.floor(Math.random() * arr.length)];

// --------------------
// ROASTS
// --------------------
const roasts = [
  "has the hockey IQ of a Zamboni — loud, slow, and only useful for cleaning up messes.",
  "skates like they learned from a YouTube tutorial made in 2009.",
  "couldn't score on an empty net if the goalie was in the parking lot.",
  "is the human equivalent of icing — pointless and just delays everything.",
  "has more excuses than a team on a 10-game losing streak.",
  "is so bad at hockey they make fans cheer for the other team.",
  "talks about hockey like they invented it but plays like they just heard of it.",
  "is the reason some teams have a 'no friends' policy at practice.",
  "has the hand-eye coordination of a blindfolded penguin on roller skates.",
  "couldn't read a play if it came with subtitles and a diagram.",
  "is like a penalty shot — lots of buildup, always ends in disappointment.",
  "has the defensive awareness of a traffic cone that called in sick.",
  "is the type to celebrate a shootout loss like it's a championship.",
  "makes bad decisions faster than a rookie on his first NHL shift.",
  "is so offside they'd get called for it standing still.",
  "has been in the sin bin so long they started paying rent.",
  "takes longer to get going than a Zamboni with a flat tire.",
  "brings the energy of a 3rd period blowout to every conversation.",
  "is one bad shift away from being a healthy scratch from life.",
  "couldn't find the net with GPS, a map, and a personal guide."
];

// --------------------
// WOULD YOU RATHER
// --------------------
const wouldYouRathers = [
  ["Score the Stanley Cup winning goal but no one sees it", "Watch your team lose game 7 in overtime on a bad call"],
  ["Be a 4th line grinder for 10 years in the NHL", "Be an AHL superstar who never gets called up"],
  ["Have the hardest slapshot in the league but terrible accuracy", "Have perfect accuracy but a shot so weak it bounces off the goalie"],
  ["Play every game with your skates on the wrong feet", "Play every game wearing a helmet two sizes too small"],
  ["Be teammates with your worst enemy", "Be coached by someone who hates you"],
  ["Win the Cup but get no ice time in the playoffs", "Play 20 minutes a game but lose in round 1 every year"],
  ["Fight the biggest guy on the ice every game", "Get chirped by the entire opposing team every game"],
  ["Score 50 goals a season but your team finishes last", "Score 5 goals but win the Cup"],
  ["Never be able to celebrate a goal", "Celebrate every goal but miss the next 5 shots"],
  ["Have Connor McDavid's speed but Zdeno Chara's height", "Have Ovechkin's shot but only be 5 feet tall"],
  ["Eat nothing but arena hot dogs for a year", "Drink nothing but sports drinks for a year"],
  ["Have unlimited pizza forever", "Never have to sleep and use that time for gaming"],
  ["Know every spoiler for every movie before watching", "Never be able to rewatch any movie or show"],
  ["Be able to pause time but only for 10 seconds", "Be able to rewind time but only 5 minutes back"],
  ["Have a pet penguin that thinks it's a dog", "Have a pet dog that thinks it's a hockey player"]
];

// --------------------
// HOCKEY FACTS
// --------------------
const hockeyFacts = [
  "The Stanley Cup is the oldest professional sports trophy in North America, first awarded in 1893.",
  "Wayne Gretzky scored more assists alone than any other player has scored total points in NHL history.",
  "The NHL puck is frozen before games to reduce bouncing on the ice.",
  "A regulation NHL ice rink is 200 feet long and 85 feet wide.",
  "Goalie pads can be no wider than 11 inches per leg under NHL rules.",
  "The Montreal Canadiens have won the Stanley Cup more times than any other team — 24 times.",
  "An NHL game puck travels at speeds up to 100 mph on a slap shot.",
  "Hockey sticks used by pros are custom made and can cost over $300 each.",
  "The first NHL game was played on December 19, 1917.",
  "Bobby Orr is the only defenseman in NHL history to win the scoring title.",
  "A standard NHL game uses between 40 and 60 pucks due to pucks going into the crowd or getting too warm.",
  "The fastest recorded NHL slapshot belongs to Zdeno Chara at 108.8 mph.",
  "Players can skate up to 30 mph during a game.",
  "The Stanley Cup has been to space — well, a replica has. Astronaut Chris Hadfield took one to the ISS.",
  "Hockey players typically lose between 5 and 8 pounds of water weight during a single game.",
  "The term 'hat trick' in hockey originally came from cricket, where a bowler who took 3 wickets was given a hat.",
  "Mario Lemieux is the only player in NHL history to score on all 5 possible situations in one game.",
  "The original Stanley Cup was only 7 inches tall. The current version is 35.25 inches tall.",
  "Patrick Roy holds the record for most career NHL wins by a goaltender with 551.",
  "The Buffalo Sabres and Vancouver Canucks both joined the NHL in the same year — 1970."
];

// --------------------
// NHL TEAMS
// --------------------
const nhlTeams = [
  { name: "Anaheim Ducks", abbrev: "ANA" },
  { name: "Boston Bruins", abbrev: "BOS" },
  { name: "Buffalo Sabres", abbrev: "BUF" },
  { name: "Calgary Flames", abbrev: "CGY" },
  { name: "Carolina Hurricanes", abbrev: "CAR" },
  { name: "Chicago Blackhawks", abbrev: "CHI" },
  { name: "Colorado Avalanche", abbrev: "COL" },
  { name: "Columbus Blue Jackets", abbrev: "CBJ" },
  { name: "Dallas Stars", abbrev: "DAL" },
  { name: "Detroit Red Wings", abbrev: "DET" },
  { name: "Edmonton Oilers", abbrev: "EDM" },
  { name: "Florida Panthers", abbrev: "FLA" },
  { name: "Los Angeles Kings", abbrev: "LAK" },
  { name: "Minnesota Wild", abbrev: "MIN" },
  { name: "Montreal Canadiens", abbrev: "MTL" },
  { name: "Nashville Predators", abbrev: "NSH" },
  { name: "New Jersey Devils", abbrev: "NJD" },
  { name: "New York Islanders", abbrev: "NYI" },
  { name: "New York Rangers", abbrev: "NYR" },
  { name: "Ottawa Senators", abbrev: "OTT" },
  { name: "Philadelphia Flyers", abbrev: "PHI" },
  { name: "Pittsburgh Penguins", abbrev: "PIT" },
  { name: "San Jose Sharks", abbrev: "SJS" },
  { name: "Seattle Kraken", abbrev: "SEA" },
  { name: "St. Louis Blues", abbrev: "STL" },
  { name: "Tampa Bay Lightning", abbrev: "TBL" },
  { name: "Toronto Maple Leafs", abbrev: "TOR" },
  { name: "Utah Hockey Club", abbrev: "UTA" },
  { name: "Vancouver Canucks", abbrev: "VAN" },
  { name: "Vegas Golden Knights", abbrev: "VGK" },
  { name: "Washington Capitals", abbrev: "WSH" },
  { name: "Winnipeg Jets", abbrev: "WPG" }
];

// --------------------
// 8BALL RESPONSES
// --------------------
const eightBallResponses = [
  // Positive
  "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, definitely.",
  "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
  "Yes.", "Signs point to yes.",
  // Neutral
  "Reply hazy, try again.", "Ask again later.", "Better not tell you now.",
  "Cannot predict now.", "Concentrate and ask again.",
  // Negative
  "Don't count on it.", "My reply is no.", "My sources say no.",
  "Outlook not so good.", "Very doubtful."
];

// --------------------
// COMPLIMENTS (not sure why someone would use this command though. The world is cruel nowadays :( ))
// --------------------
const compliments = [
  "is genuinely one of the most solid people in this server.",
  "has the energy of a player who scores in overtime — always clutch when it matters.",
  "makes this server a better place just by being here.",
  "is the kind of person every team needs in the locker room.",
  "has an absolutely elite vibe, no notes.",
  "is built different and everyone here knows it.",
  "could light up any room — or any arena.",
  "is the type of person you want in your corner during a 7-game series.",
  "has more good takes than any analyst on TV.",
  "is genuinely carrying the energy in this server.",
  "is the real MVP and it's not even close.",
  "brings the kind of good vibes that make a server actually fun.",
  "is the definition of a first-line player in real life.",
  "has a heart bigger than an NHL rink.",
  "is so awesome even the opposing team would cheer for them."
];

// --------------------
// RATE VERDICTS
// --------------------
function getRateVerdict(score) {
  if (score === 100) return "Absolute perfection. Unprecedented.";
  if (score >= 90) return "Elite tier. Basically flawless.";
  if (score >= 80) return "Really solid. Top of the lineup.";
  if (score >= 70) return "Pretty good. Respectable numbers.";
  if (score >= 60) return "Above average. Getting there.";
  if (score >= 50) return "Bang average. Right down the middle.";
  if (score >= 40) return "Bit below average. Room to improve.";
  if (score >= 30) return "Struggling. Could use some practice.";
  if (score >= 20) return "Rough. Firmly in 4th line territory.";
  if (score >= 10) return "Yikes. Healthy scratch material.";
  if (score === 0) return "Historically bad. All-time bottom of the barrel.";
  return "Not great, not terrible.";
}
// --------------------
const subredditMap = {
  meme:         "memes",
  hockeymemes:  "hockey",
  hockeygoalies:"hockey",
  monke:        "monkeys",
  goofyimages:  "funny",
  space:        "spaceporn"
};

async function fetchRedditImage(category) {
  const subreddit = subredditMap[category] || "memes";
  try {
    const response = await axios.get(`https://meme-api.com/gimme/${subreddit}`);
    const data = response.data;

    if (!data || !data.url) return null;

    return { title: data.title, url: data.url, subreddit: data.subreddit };
  } catch (err) {
    console.error(`Image fetch failed for r/${subreddit}:`, err.message);
    return null;
  }
}

const memifyImages = [
  "https://i.redd.it/placeholder"  // memify uses user text anyway, image is background only
];

// --------------------
// HANGMAN CONFIG
// --------------------
const hangmanWords = [
  "discord", "hockey", "banana", "javascript", "monkey", "internet",
  "goalie", "galaxy", "rocket", "pancake", "avalanche", "blizzard",
  "champion", "penalty", "overtime", "playoffs", "slapshot",
  "defender", "forwards", "breakaway", "faceoff", "iceskate"
];
const hangmanGames = new Map();

const hangmanStages = [
  // 0 wrong
  "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
  // 1 wrong
  "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
  // 2 wrong
  "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
  // 3 wrong
  "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
  // 4 wrong
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
  // 5 wrong
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
  // 6 wrong (dead)
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```"
];

function getHangmanEmbed(game, title) {
  const { word, guessed, tries } = game;
  const wrong = guessed.filter(l => !word.includes(l));
  const display = word.split("").map(l => guessed.includes(l) ? `**${l.toUpperCase()}**` : "\\_").join("  ");
  const wrongLetters = wrong.length > 0 ? wrong.map(l => l.toUpperCase()).join("  ") : "None";

  return new EmbedBuilder()
    .setTitle(title || "🎮 Hangman")
    .setDescription(`${hangmanStages[wrong.length]}\n**Word:** ${display}\n\n❌ **Wrong guesses (${wrong.length}/6):** ${wrongLetters}`)
    .setColor(wrong.length >= 5 ? 0xff0000 : wrong.length >= 3 ? 0xff9900 : 0x00bfff);
}

function hangmanKeyboard(guessed = []) {
  const rows = [];
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  for (let i = 0; i < 4; i++) {
    const row = new ActionRowBuilder();
    // rows of 7, 7, 7, 5
    const slice = i < 3 ? letters.slice(i * 7, i * 7 + 7) : letters.slice(21);
    slice.forEach(l => {
      const correct = hangmanGames.size > 0; // placeholder, handled per-game
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`hang_${l}`)
          .setLabel(l.toUpperCase())
          .setStyle(guessed.includes(l) ? ButtonStyle.Secondary : ButtonStyle.Primary)
          .setDisabled(guessed.includes(l))
      );
    });
    rows.push(row);
  }
  return rows;
}

function buildHangmanKeyboard(guessed = []) {
  const rows = [];
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  // 5 rows of 5, then 1 row of 1 — but Discord max is 5 rows of 5 buttons = 25
  // So we show a-y (25 letters) in 5 rows of 5, and z gets its own row capped at 5
  const chunks = [
    letters.slice(0, 5),
    letters.slice(5, 10),
    letters.slice(10, 15),
    letters.slice(15, 20),
    letters.slice(20, 26) // z included, 6 letters — Discord allows max 5 per row
  ];
  // Split last chunk: put first 5 in row 5, and z in... actually just do 5+5+5+5+5+1
  // Simplest: 5 rows of 5 = a-y, z appended to row 5 making it row of 6 which fails
  // Solution: skip z or include it in row 5 as 6th — Discord rejects >5 per row
  // So: 5 rows of 5 (a-y), z disabled note shown in embed instead
  const safeChunks = [
    letters.slice(0, 5),
    letters.slice(5, 10),
    letters.slice(10, 15),
    letters.slice(15, 20),
    letters.slice(20, 25) // a-y only, z almost never appears in words anyway
  ];
  for (const chunk of safeChunks) {
    const row = new ActionRowBuilder();
    chunk.forEach(l => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`hang_${l}`)
          .setLabel(l.toUpperCase())
          .setStyle(ButtonStyle.Primary)
          .setDisabled(guessed.includes(l))
      );
    });
    rows.push(row);
  }
  return rows;
}

// --------------------
// COUNTING DATA PERSISTENCE SYSTEM
// --------------------
const dataFilePath = path.join(__dirname, "countingData.json");
const processedIdsPath = path.join(__dirname, "processedIds.json");

let countingState = {
  currentNumber: 0,
  lastUserId: null
};

function loadCountingData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, "utf8");
      const parsed = JSON.parse(raw);
      countingState.currentNumber = parsed.currentNumber || 0;
      // Clear lastUserId on restart so the last counter can count again after a restart
      countingState.lastUserId = null;
      console.log(`💾 Counting data loaded. Resuming at: ${countingState.currentNumber}`);
    } else {
      saveCountingData();
      console.log("💾 No counting data found, starting fresh at 0.");
    }
  } catch (error) {
    console.error("❌ Failed to load counting data:", error.message);
    countingState = { currentNumber: 0, lastUserId: null };
    saveCountingData();
  }
}

function saveCountingData() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(countingState, null, 2), "utf8");
  } catch (error) {
    console.error("❌ Failed to save counting data:", error.message);
  }
}

// Cross process deduplication using a shared file
function claimMessageId(id) {
  try {
    let ids = [];
    if (fs.existsSync(processedIdsPath)) {
      ids = JSON.parse(fs.readFileSync(processedIdsPath, "utf8"));
    }
    if (ids.includes(id)) return false; // already claimed
    ids.push(id);
    // Keep only last 200 IDs
    if (ids.length > 200) ids = ids.slice(-200);
    fs.writeFileSync(processedIdsPath, JSON.stringify(ids), "utf8");
    return true;
  } catch {
    return true; // if file lock fails, allow processing
  }
}

loadCountingData();

// --------------------
// SLASH COMMAND REGISTRATION
// --------------------
const commands = [
  new SlashCommandBuilder().setName("meme").setDescription("Get memes"),
  new SlashCommandBuilder().setName("hockeymemes").setDescription("Get hockey memes"),
  new SlashCommandBuilder().setName("hockeygoalies").setDescription("Get goalie memes"),
  new SlashCommandBuilder().setName("monke").setDescription("Random monkey images"),
  new SlashCommandBuilder().setName("goofyimages").setDescription("Goofy images"),
  new SlashCommandBuilder().setName("space").setDescription("NASA space images"),
  new SlashCommandBuilder()
    .setName("memify")
    .setDescription("Make a meme")
    .addStringOption(o =>
      o.setName("text")
       .setDescription("Text for your meme")
       .setRequired(true)
    ),
  new SlashCommandBuilder().setName("hangman").setDescription("Play hangman"),
  new SlashCommandBuilder().setName("rps").setDescription("Play rock paper scissors against the bot"),
  new SlashCommandBuilder()
    .setName("ship")
    .setDescription("See how compatible two people are")
    .addUserOption(o => o.setName("user1").setDescription("First person").setRequired(true))
    .addUserOption(o => o.setName("user2").setDescription("Second person").setRequired(true)),
  new SlashCommandBuilder()
    .setName("roast")
    .setDescription("Roast someone")
    .addUserOption(o => o.setName("target").setDescription("Who to roast").setRequired(true)),
  new SlashCommandBuilder().setName("wouldyourather").setDescription("Get a would you rather question"),
  new SlashCommandBuilder().setName("hockeyfact").setDescription("Get a random hockey fact"),
  new SlashCommandBuilder().setName("hockeyscore").setDescription("Get today's NHL scores"),
  new SlashCommandBuilder()
    .setName("hockeyteam")
    .setDescription("Look up an NHL team's standings stats")
    .addStringOption(o =>
      o.setName("team")
       .setDescription("Pick a team")
       .setRequired(true)
       .setAutocomplete(true)
    ),
  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8 ball a question")
    .addStringOption(o => o.setName("question").setDescription("Your question").setRequired(true)),
  new SlashCommandBuilder().setName("coinflip").setDescription("Flip a coin"),
  new SlashCommandBuilder()
    .setName("compliment")
    .setDescription("Send someone a compliment")
    .addUserOption(o => o.setName("user").setDescription("Who to compliment").setRequired(true)),
  new SlashCommandBuilder()
    .setName("rate")
    .setDescription("Get a rating for anything")
    .addStringOption(o => o.setName("thing").setDescription("What to rate").setRequired(true)),
  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show someone's profile picture")
    .addUserOption(o => o.setName("user").setDescription("User to get avatar of").setRequired(false)),
  new SlashCommandBuilder().setName("hockeystandings").setDescription("Show current NHL division standings"),
  new SlashCommandBuilder().setName("nhlplayoffs").setDescription("Show current NHL playoff bracket")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Commands registered cleanly");
  } catch (err) {
    console.error(err);
  }
})();

// --------------------
// TEXT MESSAGE EVENTS (💯・counting ENGINE)
// --------------------
const countingQueue = [];
let processingCounting = false;
const processedMessageIds = new Set();

async function processCountingMessage(message) {
  const cleanContent = message.content.trim();
  const inputNumber = parseInt(cleanContent, 10);

  if (isNaN(inputNumber) || inputNumber.toString() !== cleanContent) return;

  const expectedNumber = countingState.currentNumber + 1;

  if (inputNumber !== expectedNumber) {
    countingState.currentNumber = 0;
    countingState.lastUserId = null;
    saveCountingData();
    await message.react("❌");
    await message.reply(`${message.author.username} ruined it at ${inputNumber}. Correct next number was ${expectedNumber}.`);
    return;
  }

  if (message.author.id === countingState.lastUserId) {
    countingState.currentNumber = 0;
    countingState.lastUserId = null;
    saveCountingData();
    await message.react("❌");
    await message.reply(`${message.author.username} ruined it at ${inputNumber}. Reason: You cannot count twice in a row!`);
    return;
  }

  countingState.currentNumber = inputNumber;
  countingState.lastUserId = message.author.id;
  saveCountingData();
  await message.react("✅");
}

async function runCountingQueue() {
  if (processingCounting) return;
  processingCounting = true;
  while (countingQueue.length > 0) {
    const message = countingQueue.shift();
    await processCountingMessage(message);
  }
  processingCounting = false;
}

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (message.channel.id !== "1434732796760555560") return;
  if (message.content.trim().startsWith("/")) return;
  if (!claimMessageId(message.id)) return; // another process already handled this

  countingQueue.push(message);
  runCountingQueue();
});

// --------------------
// SLASH INTERACTION EVENT ENGINE
// --------------------
client.on("interactionCreate", async interaction => {
  try {
    // AUTOCOMPLETE HANDLER
    if (interaction.isAutocomplete()) {
      if (interaction.commandName === "hockeyteam") {
        const focused = interaction.options.getFocused().toLowerCase();
        const filtered = nhlTeams
          .filter(t => t.name.toLowerCase().includes(focused) || t.abbrev.toLowerCase().includes(focused))
          .slice(0, 25)
          .map(t => ({ name: t.name, value: t.abbrev }));
        return interaction.respond(filtered);
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const cmd = interaction.commandName;

    // memify command
    if (cmd === "memify") {
      const text = interaction.options.getString("text");
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("😂 Meme")
            .setDescription(text.toUpperCase())
            .setImage(rand(memifyImages))
            .setColor(0xff9900)
        ]
      });
    }

    // hangman minigame command
    if (cmd === "hangman") {
      const word = rand(hangmanWords);
      const game = { word, guessed: [], tries: 6 };
      hangmanGames.set(interaction.user.id, game);

      return interaction.reply({
        embeds: [getHangmanEmbed(game)],
        components: buildHangmanKeyboard([])
      });
    }

    // DIRECT FEED COMMAND ROUTER (Goofy, Memes, Monke, Space, Hockey)
    const imageCmds = ["meme", "hockeymemes", "hockeygoalies", "monke", "goofyimages", "space"];
    if (imageCmds.includes(cmd)) {
      const titles = {
        meme: "🤣 Fresh Meme Delivery",
        hockeymemes: "🏒 Hockey Meme Central",
        hockeygoalies: "🥅 Goalie Content Feed",
        monke: "🐒 Monkey Photo Feed",
        goofyimages: "😜 Goofy Picture Vault",
        space: "🌌 Space Feed"
      };

      // Defer first since Reddit fetch can take a moment
      await interaction.deferReply();

      const post = await fetchRedditImage(cmd);

      if (!post) {
        return interaction.editReply({ content: "⚠️ Couldn't fetch an image right now. Try again in a moment." });
      }

      const responseEmbed = new EmbedBuilder()
        .setTitle(post.title.slice(0, 256))
        .setImage(post.url)
        .setColor(0x00bfff)
        .setFooter({ text: `r/${post.subreddit || subredditMap[cmd]} • bob the bot` });

      return interaction.editReply({ embeds: [responseEmbed] });
    }

    // ship ppl command
    if (cmd === "ship") {
      const user1 = interaction.options.getUser("user1");
      const user2 = interaction.options.getUser("user2");
      const score = Math.floor(Math.random() * 101);
      let verdict = "";
      const filled = Math.floor(score / 10);
      const meter = "❤️".repeat(filled) + "🖤".repeat(10 - filled);
      if (score >= 90) verdict = "Soulmates. It's basically fate at this point.";
      else if (score >= 75) verdict = "Really strong match. Don't mess it up.";
      else if (score >= 60) verdict = "Pretty solid. Could definitely work.";
      else if (score >= 45) verdict = "It's a coin flip. Feelings might be complicated.";
      else if (score >= 30) verdict = "Unlikely but stranger things have happened.";
      else verdict = "Yikes. Not great. Maybe just stay friends.";
      const shipName = user1.username.slice(0, Math.ceil(user1.username.length / 2)) + user2.username.slice(Math.floor(user2.username.length / 2));
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💘 ${user1.username} + ${user2.username}`)
            .setDescription(`**Ship name:** ${shipName}\n\n${meter}\n\n**${score}% compatible**\n${verdict}`)
            .setColor(0xff69b4)
        ]
      });
    }

    // roast command
    if (cmd === "roast") {
      const target = interaction.options.getUser("target");
      const roast = rand(roasts);
      return interaction.reply(`🔥 ${target} ${roast}`);
    }

    // would you rather command
    if (cmd === "wouldyourather") {
      const [a, b] = rand(wouldYouRathers);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🤔 Would You Rather...")
            .setDescription(`**A)** ${a}\n\n**or**\n\n**B)** ${b}`)
            .setColor(0x9b59b6)
            .setFooter({ text: "Reply with A or B!" })
        ]
      });
    }

    // hockey fact command
    if (cmd === "hockeyfact") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🏒 Hockey Fact")
            .setDescription(rand(hockeyFacts))
            .setColor(0x1d6fa5)
        ]
      });
    }

    // HOCKEY SCORE COMMAND
    if (cmd === "hockeyscore") {
      await interaction.deferReply();
      try {
        const res = await axios.get("https://api-web.nhle.com/v1/score/now");
        const games = res.data.games;
        if (!games || games.length === 0) {
          return interaction.editReply({ content: "No NHL games scheduled today." });
        }
        const lines = games.map(g => {
          const away = g.awayTeam;
          const home = g.homeTeam;
          const state = g.gameState;
          if (state === "FUT" || state === "PRE") {
            const time = new Date(g.startTimeUTC).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" });
            return `**${away.abbrev}** vs **${home.abbrev}** — ${time}`;
          } else if (state === "LIVE" || state === "CRIT") {
            const period = g.periodDescriptor?.periodType === "OT" ? "OT" : g.periodDescriptor?.periodType === "SO" ? "SO" : `P${g.periodDescriptor?.number || "?"}`;
            return `**${away.abbrev} ${away.score ?? 0}** — **${home.score ?? 0} ${home.abbrev}** 🔴 LIVE (${period})`;
          } else {
            const period = g.periodDescriptor?.periodType === "OT" ? "/OT" : g.periodDescriptor?.periodType === "SO" ? "/SO" : "";
            return `**${away.abbrev} ${away.score ?? 0}** — **${home.score ?? 0} ${home.abbrev}** ✅ Final${period}`;
          }
        });
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`🏒 NHL Scores — ${res.data.currentDate}`)
              .setDescription(lines.join("\n"))
              .setColor(0x1d6fa5)
          ]
        });
      } catch (err) {
        console.error("NHL score fetch failed:", err.message);
        return interaction.editReply({ content: "⚠️ Couldn't fetch scores right now. Try again in a moment." });
      }
    }

    // hockey team command
    if (cmd === "hockeyteam") {
      await interaction.deferReply();
      const abbrev = interaction.options.getString("team");
      try {
        const res = await axios.get("https://api-web.nhle.com/v1/standings/now");
        const team = res.data.standings.find(t => (t.teamAbbrev?.default || t.teamAbbrev) === abbrev);
        if (!team) {
          return interaction.editReply({ content: `⚠️ Couldn't find stats for that team.` });
        }
        const name = team.teamName?.default || team.teamCommonName?.default || abbrev;
        const logo = team.teamLogo || team.teamLogoDark || null;
        const embed = new EmbedBuilder()
          .setTitle(`🏒 ${name}`)
          .setColor(0x1d6fa5)
          .addFields(
            { name: "Record", value: `${team.wins}-${team.losses}-${team.otLosses}`, inline: true },
            { name: "Points", value: `${team.points}`, inline: true },
            { name: "Games Played", value: `${team.gamesPlayed}`, inline: true },
            { name: "Goals For", value: `${team.goalFor}`, inline: true },
            { name: "Goals Against", value: `${team.goalAgainst}`, inline: true },
            { name: "Goal Diff", value: `${team.goalDifferential > 0 ? "+" : ""}${team.goalDifferential}`, inline: true },
            { name: "Division", value: team.divisionName, inline: true },
            { name: "Conference", value: team.conferenceName, inline: true },
            { name: "Streak", value: `${team.streakCount}${team.streakCode}`, inline: true }
          );
        if (logo) embed.setThumbnail(logo);
        return interaction.editReply({ embeds: [embed] });
      } catch (err) {
        console.error("NHL team fetch failed:", err.message);
        return interaction.editReply({ content: "⚠️ Couldn't fetch team stats right now. Try again in a moment." });
      }
    }

    // rock paper scissors (rps) command
    if (cmd === "rps") {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("rps_rock").setLabel("🪨 Rock").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("rps_paper").setLabel("📄 Paper").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("rps_scissors").setLabel("✂️ Scissors").setStyle(ButtonStyle.Primary)
      );
      return interaction.reply({
        embeds: [new EmbedBuilder().setTitle("🪨📄✂️ Rock Paper Scissors").setDescription("Pick your move!").setColor(0x9b59b6)],
        components: [row]
      });
    }

    // button interactions
    if (interaction.isButton()) return; // handled below

    // 8ball command
    if (cmd === "8ball") {
      const question = interaction.options.getString("question");
      const answer = rand(eightBallResponses);
      const idx = eightBallResponses.indexOf(answer);
      const color = idx < 10 ? 0x00cc00 : idx < 15 ? 0xffaa00 : 0xff0000;
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎱 Magic 8 Ball")
            .addFields(
              { name: "Question", value: question },
              { name: "Answer", value: answer }
            )
            .setColor(color)
        ]
      });
    }

    // coinflip command
    if (cmd === "coinflip") {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🪙 ${result}!`)
            .setDescription(`The coin landed on **${result}**.`)
            .setColor(result === "Heads" ? 0xf1c40f : 0x95a5a6)
        ]
      });
    }

    // compliment someone command
    if (cmd === "compliment") {
      const user = interaction.options.getUser("user");
      const compliment = rand(compliments);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("💛 Compliment")
            .setDescription(`${user} ${compliment}`)
            .setColor(0xf1c40f)
        ]
      });
    }

    // rate stuff command
    if (cmd === "rate") {
      const thing = interaction.options.getString("thing");
      const score = Math.floor(Math.random() * 101);
      const verdict = getRateVerdict(score);
      const bar = "█".repeat(Math.floor(score / 10)) + "░".repeat(10 - Math.floor(score / 10));
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`📊 Rating: ${thing}`)
            .setDescription(`\`${bar}\` **${score}/100**\n\n${verdict}`)
            .setColor(score >= 70 ? 0x00cc00 : score >= 40 ? 0xffaa00 : 0xff0000)
        ]
      });
    }

    // avatar command
    if (cmd === "avatar") {
      const user = interaction.options.getUser("user") || interaction.user;
      const avatarUrl = user.displayAvatarURL({ size: 1024, extension: "png" });
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🖼️ ${user.username}'s Avatar`)
            .setImage(avatarUrl)
            .setColor(0x5865f2)
            .setFooter({ text: "Click the image to open full size" })
        ]
      });
    }

    // hockey standings command
    if (cmd === "hockeystandings") {
      await interaction.deferReply();
      try {
        const res = await axios.get("https://api-web.nhle.com/v1/standings/now");
        const standings = res.data.standings;
        const divisionOrder = ["Atlantic", "Metropolitan", "Central", "Pacific"];
        const divisionEmojis = { Atlantic: "🌊", Metropolitan: "🏙️", Central: "⭐", Pacific: "🌅" };

        const fields = divisionOrder.map(div => {
          const teams = standings
            .filter(t => t.divisionName === div)
            .sort((a, b) => b.points - a.points);
          const lines = teams.map((t, i) => {
            const name = t.teamAbbrev?.default || t.teamAbbrev;
            const clinch = t.clinchIndicator ? ` \`${t.clinchIndicator}\`` : "";
            return `${i + 1}. **${name}**${clinch} — ${t.points}pts (${t.wins}-${t.losses}-${t.otLosses})`;
          }).join("\n");
          return { name: `${divisionEmojis[div]} ${div}`, value: lines, inline: false };
        });

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🏒 NHL Division Standings")
              .addFields(fields)
              .setColor(0x1d6fa5)
              .setFooter({ text: `As of ${res.data.standings[0]?.date || "latest"}` })
          ]
        });
      } catch (err) {
        console.error("Standings fetch failed:", err.message);
        return interaction.editReply({ content: "⚠️ Couldn't fetch standings right now. Try again in a moment." });
      }
    }

    // nhl playoffs command
    if (cmd === "nhlplayoffs") {
      await interaction.deferReply();
      try {
        const res = await axios.get("https://api-web.nhle.com/v1/playoff-series/carousel/20252026/");
        const { rounds, currentRound } = res.data;
        const roundNames = { 1: "First Round", 2: "Second Round", 3: "Conference Finals", 4: "Stanley Cup Final" };

        const fields = rounds.map(round => {
          const lines = round.series.map(s => {
            const top = s.topSeed;
            const bot = s.bottomSeed;
            const winner = top.wins === 4 ? top.abbrev : bot.wins === 4 ? bot.abbrev : null;
            const score = `${top.wins}-${bot.wins}`;
            if (winner) return `~~**${top.abbrev}** vs **${bot.abbrev}**~~ → **${winner}** wins`;
            return `**${top.abbrev}** vs **${bot.abbrev}** — ${score}`;
          }).join("\n");
          return {
            name: `${round.roundNumber === currentRound ? "🔴 " : "✅ "}${roundNames[round.roundNumber] || `Round ${round.roundNumber}`}`,
            value: lines || "TBD",
            inline: false
          };
        });

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🏆 NHL Playoff Bracket — 2025-26")
              .addFields(fields)
              .setColor(0xf1c40f)
              .setFooter({ text: `Currently in: ${roundNames[currentRound] || `Round ${currentRound}`}` })
          ]
        });
      } catch (err) {
        console.error("Playoffs fetch failed:", err.message);
        return interaction.editReply({ content: "⚠️ Playoff data isn't available right now. This command works during the playoff season." });
      }
    }

  } catch (error) {
    console.error("Interaction exception handling loop fired:", error);
    // get response in 3 second window 
    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({ content: "⚠️ An internal layout rendering error occurred. Please try again in a few seconds.", ephemeral: true }).catch(() => null);
    }
  }
});

// --------------------
// button interaction handler
// --------------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  // RPS BUTTONS
  if (interaction.customId.startsWith("rps_")) {
    const choices = ["rock", "paper", "scissors"];
    const emojis = { rock: "🪨", paper: "📄", scissors: "✂️" };
    const playerChoice = interaction.customId.replace("rps_", "");
    const botChoice = rand(choices);

    let result = "";
    let color = 0xffffff;
    if (playerChoice === botChoice) {
      result = "It's a tie!";
      color = 0xffff00;
    } else if (
      (playerChoice === "rock" && botChoice === "scissors") ||
      (playerChoice === "paper" && botChoice === "rock") ||
      (playerChoice === "scissors" && botChoice === "paper")
    ) {
      result = "You win! 🎉";
      color = 0x00ff00;
    } else {
      result = "You lose! 😈";
      color = 0xff0000;
    }

    return interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle("🪨📄✂️ Rock Paper Scissors")
          .setDescription(`You picked **${emojis[playerChoice]} ${playerChoice}**\nBob picked **${emojis[botChoice]} ${botChoice}**\n\n**${result}**`)
          .setColor(color)
      ],
      components: []
    });
  }

  // hangman big ass buttons 
  if (interaction.customId.startsWith("hang_")) {
    const letter = interaction.customId.replace("hang_", "");
    const game = hangmanGames.get(interaction.user.id);

    if (!game) {
      return interaction.reply({ content: "No active hangman game. Use `/hangman` to start one.", ephemeral: true });
    }

    if (game.guessed.includes(letter)) {
      return interaction.reply({ content: "Already guessed that letter!", ephemeral: true });
    }

    game.guessed.push(letter);
    const wrong = game.guessed.filter(l => !game.word.includes(l));
    const won = game.word.split("").every(l => game.guessed.includes(l));
    const lost = wrong.length >= 6;

    if (won) {
      hangmanGames.delete(interaction.user.id);
      return interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎉 You Won!")
            .setDescription(`${hangmanStages[wrong.length]}\nThe word was **${game.word.toUpperCase()}**!\nYou got it with ${wrong.length} wrong guess${wrong.length !== 1 ? "es" : ""}.`)
            .setColor(0x00ff00)
        ],
        components: []
      });
    }

    if (lost) {
      hangmanGames.delete(interaction.user.id);
      return interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle("💀 Game Over!")
            .setDescription(`${hangmanStages[6]}\nThe word was **${game.word.toUpperCase()}**.\nBetter luck next time!`)
            .setColor(0xff0000)
        ],
        components: []
      });
    }

    return interaction.update({
      embeds: [getHangmanEmbed(game)],
      components: buildHangmanKeyboard(game.guessed)
    });
  }
});
// private
// --------------------
const BOT_OWNER_ID = "1135600413954019339";

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (message.author.id !== BOT_OWNER_ID) return;
  if (!message.content.startsWith("!say ")) return;
  if (message.guild) return; // only works via DM — invisible to everyone

  const content = message.content.slice(5).trim();
  const channelMention = content.match(/^<#(\d+)>\s*/) || content.match(/^(\d+)\s*/);

  if (!channelMention) {
    return message.reply("Usage: `!say <channelid> your message here`");
  }

  const channelId = channelMention[1];
  const text = content.slice(channelMention[0].length).trim();

  if (!text) return message.reply("Can't send an empty message.");

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) return message.reply("Couldn't find that channel.");

  await channel.send(text);
  await message.reply("✅ Sent.");
});

client.once("ready", () => {
  console.log(`🚀 ${client.user.tag} successfully initialized and tracking real-time subreddit networks!`);
});

client.login(token);

