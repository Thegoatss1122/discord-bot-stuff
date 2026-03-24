const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

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
  intents: [GatewayIntentBits.Guilds]
});

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Fallback Images
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

const fallbackImages = [
  "https://i.imgur.com/1Jm8Q5y.jpeg",
  "https://i.imgur.com/9bK0FZl.jpeg",
  "https://i.imgur.com/8Km9tLL.jpeg"
];

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Memify Images
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

const memifyImages = [
  "https://i.pinimg.com/736x/71/54/0d/71540d33c1dc92647f434879a1c7db52.jpg",
  "https://i.pinimg.com/736x/c4/f0/8f/c4f08fe25118e1b4f6fb53543e39f4db.jpg",
  "https://i.pinimg.com/736x/62/44/fc/6244fc96dca19d75c77f62e764949323.jpg",
  "https://i.pinimg.com/736x/b4/95/b5/b495b528bb5f4778039e1c23e762e9e7.jpg",
  "https://i.pinimg.com/736x/56/d6/e4/56d6e47b6278b32ecfb9278b9fc79b7d.jpg"
];

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Subreddits
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

const memeSubs = ["memes","dankmemes","funny"];
const hockeySubs = ["hockeymemes","NHLMemes"];
const goalieSubs = ["hockeygoalies"];
const monkeySubs = ["MonkeyMemes","ape"];

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Fetch Reddit
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

async function fetchSub(sub) {
  try {
    const res = await axios.get(`https://www.reddit.com/r/${sub}/hot.json?limit=50`, {
      headers: { "User-Agent": "discord-bot" }
    });

    return res.data.data.children
      .map(p => p.data)
      .filter(p =>
        !p.over_18 &&
        (
          p.url?.match(/\.(jpg|jpeg|png|gif)$/i) ||
          p.preview?.images?.[0]?.source?.url
        )
      );

  } catch (err) {
    console.error(`Reddit error (${sub}):`, err.message);
    return [];
  }
}

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Cache
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

let memeCache = [];
let hockeyCache = [];
let goalieCache = [];
let monkeyCache = [];

async function refreshCaches() {
  console.log("🔄 Refreshing caches...");
  memeCache = (await Promise.all(memeSubs.map(fetchSub))).flat();
  hockeyCache = (await Promise.all(hockeySubs.map(fetchSub))).flat();
  goalieCache = (await Promise.all(goalieSubs.map(fetchSub))).flat();
  monkeyCache = (await Promise.all(monkeySubs.map(fetchSub))).flat();
  console.log("✅ Cache ready");
}

refreshCaches();
setInterval(refreshCaches, 10 * 60 * 1000);

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Build Post
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

function buildPost(post) {
  const image =
    post?.url ||
    post?.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") ||
    fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(post?.title || "Random Image")
        .setImage(image)
        .setColor(0x00bfff)
    ]
  };
}

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Hangman
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

const hangmanWords = [
  "discord","hockey","banana","javascript",
  "monkey","internet","goalie","galaxy","rocket","pancake"
];

const hangmanGames = new Map();

const WIN_GIF = "https://media1.tenor.com/m/EwY2ORle_XAAAAAd/wizard-dance.gif";
const LOSE_GIF = "https://media1.tenor.com/m/-vrZWF9Ly18AAAAd/wet-eggplant.gif";

function getDisplayWord(word, guessed) {
  return word.split("").map(l => guessed.includes(l) ? l : "_").join(" ");
}

function keyboard(disabled = []) {
  const rows = [];
  const letters = "abcdefghijklmnopqrstuvwxy".split("");

  for (let i = 0; i < 5; i++) {
    const row = new ActionRowBuilder();
    letters.slice(i * 5, i * 5 + 5).forEach(l => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`hang_${l}`)
          .setLabel(l.toUpperCase())
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(disabled.includes(l))
      );
    });
    rows.push(row);
  }

  return rows;
}

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Commands
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

const commands = [
  new SlashCommandBuilder().setName("meme").setDescription("Get memes"),
  new SlashCommandBuilder().setName("hockeymemes").setDescription("Get hockey memes"),
  new SlashCommandBuilder().setName("hockeygoalies").setDescription("Get goalie memes"),
  new SlashCommandBuilder().setName("monke").setDescription("Random monkey images"),
  new SlashCommandBuilder().setName("goofyimages").setDescription("Goofy images"),
  new SlashCommandBuilder().setName("space").setDescription("Space images"),
  new SlashCommandBuilder()
    .setName("memify")
    .setDescription("Make a meme")
    .addStringOption(o =>
      o.setName("text")
       .setDescription("Text for your meme")
       .setRequired(true)
    ),
  new SlashCommandBuilder().setName("hangman").setDescription("Play hangman")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Commands registered");
  } catch (err) {
    console.error(err);
  }
})();

const rand = arr => arr[Math.floor(Math.random() * arr.length)];

client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === "memify") {
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

      if (interaction.commandName === "space") {
        const posts = await fetchSub("spaceporn");
        return interaction.reply(buildPost(rand(posts)));
      }

      if (interaction.commandName === "hangman") {
        const word = rand(hangmanWords);
        hangmanGames.set(interaction.user.id, { word, guessed: [], tries: 6 });

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🎮 Hangman")
              .setDescription(`Word: ${getDisplayWord(word, [])}\nTries: 6`)
          ],
          components: keyboard()
        });
      }

      let cache = [];

      if (interaction.commandName === "meme") cache = memeCache;
      if (interaction.commandName === "hockeymemes") cache = hockeyCache;
      if (interaction.commandName === "hockeygoalies") cache = goalieCache;
      if (interaction.commandName === "monke") cache = monkeyCache;
      if (interaction.commandName === "goofyimages") cache = memifyImages.map(u => ({ url: u }));

      return interaction.reply(buildPost(rand(cache)));
    }

    if (interaction.isButton()) {
      const letter = interaction.customId.split("_")[1];
      const game = hangmanGames.get(interaction.user.id);
      if (!game) return;

      if (!game.guessed.includes(letter)) {
        game.guessed.push(letter);
        if (!game.word.includes(letter)) game.tries--;
      }

      const display = getDisplayWord(game.word, game.guessed);

      if (!display.includes("_")) {
        hangmanGames.delete(interaction.user.id);
        return interaction.update({
          content: WIN_GIF,
          embeds: [new EmbedBuilder().setTitle("🎉 YOU WON!")],
          components: []
        });
      }

      if (game.tries <= 0) {
        hangmanGames.delete(interaction.user.id);
        return interaction.update({
          content: LOSE_GIF,
          embeds: [new EmbedBuilder().setTitle("💀 YOU LOST!").setDescription(`Word: ${game.word}`)],
          components: []
        });
      }

      return interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎮 Hangman")
            .setDescription(`Word: ${display}\nTries: ${game.tries}`)
        ],
        components: keyboard(game.guessed)
      });
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({ content: "❌ Error", ephemeral: true });
    }
  }
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(token);
