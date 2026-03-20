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

const token = config.DISCORD_TOKEN?.trim();

if (!token) {
  console.error("❌ Token is missing!");
  process.exit(1);
}

const CLIENT_ID = "1441541093156982975";
const GUILD_ID = "1385650154832662688";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// --------------------
// SUBREDDITS
// --------------------
const memeSubs = ["memes","meme","dankmemes","Random_Memes","Funnymemes","funny","oldmemes"];
const hockeySubs = ["hockeymemes","NHLMemes","Icehockeymemes","hockeygearmemes"];
const goalieSubs = ["hockeygoalies"];
const monkeySubs = ["FreeTheMonkeys","punchthemonkey","ape","MonkeyMemes"];

// --------------------
// MONKEY IMAGES
// --------------------
const monkeyImages = [
  "https://i.pinimg.com/736x/f0/cb/00/f0cb0024df9a8fa950aac66295b10cb0.jpg",
  "https://i.pinimg.com/1200x/4d/70/f4/4d70f4962981b8b6f06f1874da87209a.jpg",
  "https://i.pinimg.com/1200x/f8/e1/5b/f8e15bcd1a3aba568c14a1afd24810c0.jpg",
  "https://i.pinimg.com/736x/c0/d1/b5/c0d1b5920d474e1a702ca680039bb07e.jpg",
  "https://i.pinimg.com/736x/1a/6f/f2/1a6ff2c75346f6670872231ac8c8c728.jpg",
  "https://i.pinimg.com/736x/e0/e7/0c/e0e70c256102543baaee423fec59e015.jpg",
  "https://i.pinimg.com/736x/0a/7f/ff/0a7fff9fb5356a3db684a548b8a06b7c.jpg",
  "https://i.pinimg.com/736x/f5/f0/76/f5f07626ce263bd7370d42bac63205c3.jpg",
  "https://i.pinimg.com/1200x/a8/4b/6e/a84b6e5c8dd9558f593707c858a5578a.jpg",
  "https://i.pinimg.com/736x/20/5d/1f/205d1f3f05ab85624798a9f4d4c5c6bb.jpg",
  "https://i.pinimg.com/736x/b0/95/30/b09530578f8396b925e2b6a1cedc90da.jpg"
];

// --------------------
// BLACKLIST (no "shit")
// --------------------
const blacklist = [
  "nigger", "faggot", "bitch", "cunt", "asshole", "slut", "fuck"
];

function containsBlacklisted(text) {
  if (!text) return false;
  text = text.toLowerCase();
  return blacklist.some(word => text.includes(word));
}

// --------------------
// FETCH + CACHE
// --------------------
let memeCache = [];
let hockeyCache = [];
let goalieCache = [];
let monkeyCache = [];

async function fetchSub(sub) {
  try {
    const res = await axios.get(`https://www.reddit.com/r/${sub}/hot.json?limit=50`);
    return res.data.data.children.map(p => p.data);
  } catch {
    return [];
  }
}

async function buildCache(subs) {
  let posts = [];
  for (const sub of subs) {
    posts.push(...(await fetchSub(sub)));
  }

  return posts.filter(p => !p.over_18 && !containsBlacklisted(p.title));
}

async function refreshCaches() {
  console.log("Refreshing caches...");
  memeCache = await buildCache(memeSubs);
  hockeyCache = await buildCache(hockeySubs);
  goalieCache = await buildCache(goalieSubs);
  monkeyCache = await buildCache(monkeySubs);
  console.log("Caches ready");
}

refreshCaches();
setInterval(refreshCaches, 10 * 60 * 1000);

// --------------------
// BUTTONS
// --------------------
function buttons(type) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`next_${type}`)
      .setLabel("Next 🔄")
      .setStyle(ButtonStyle.Primary)
  );
}

// --------------------
// BUILD POST
// --------------------
function buildPost(post) {
  if (!post) return { content: "No content available" };

  if (post.is_video && post.media?.reddit_video?.fallback_url) {
    return { content: `**${post.title}**\n${post.media.reddit_video.fallback_url}` };
  }

  if (post.url && (post.url.endsWith(".jpg") || post.url.endsWith(".png") || post.url.endsWith(".gif"))) {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle(post.title || "🐵 monke")
          .setURL(post.permalink ? `https://reddit.com${post.permalink}` : null)
          .setImage(post.url)
          .setColor(0x00bfff)
      ]
    };
  }

  return { content: `**${post.title}**\nhttps://reddit.com${post.permalink}` };
}

// --------------------
// COMMANDS
// --------------------
const commands = [
  new SlashCommandBuilder().setName("meme").setDescription("Trending memes"),
  new SlashCommandBuilder().setName("hockeymemes").setDescription("Trending hockey memes"),
  new SlashCommandBuilder().setName("hockeygoalies").setDescription("Trending goalie memes"),
  new SlashCommandBuilder().setName("monke").setDescription("Random monke 🐵")
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

// --------------------
// RANDOM HELPER
// --------------------
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

// --------------------
// INTERACTIONS
// --------------------
client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      let cache, type;

      if (interaction.commandName === "meme") { cache = memeCache; type = "meme"; }
      if (interaction.commandName === "hockeymemes") { cache = hockeyCache; type = "hockey"; }
      if (interaction.commandName === "hockeygoalies") { cache = goalieCache; type = "goalie"; }

      if (interaction.commandName === "monke") {
        const combined = [
          ...monkeyCache,
          ...monkeyImages.map(url => ({ title: "🐵 monke", url }))
        ];

        const post = rand(combined);

        return await interaction.reply({
          ...buildPost(post),
          components: [buttons("monke")]
        });
      }

      const post = rand(cache);
      await interaction.reply({
        ...buildPost(post),
        components: [buttons(type)]
      });
    }

    if (interaction.isButton()) {
      let cache;

      if (interaction.customId === "next_meme") cache = memeCache;
      if (interaction.customId === "next_hockey") cache = hockeyCache;
      if (interaction.customId === "next_goalie") cache = goalieCache;

      if (interaction.customId === "next_monke") {
        const combined = [
          ...monkeyCache,
          ...monkeyImages.map(url => ({ title: "🐵 monke", url }))
        ];

        const post = rand(combined);

        return await interaction.update({
          ...buildPost(post),
          components: [interaction.message.components[0]]
        });
      }

      const post = rand(cache);
      await interaction.update({
        ...buildPost(post),
        components: [interaction.message.components[0]]
      });
    }

  } catch (err) {
    console.error("Interaction error:", err);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: "❌ Something went wrong" });
    } else {
      await interaction.reply({ content: "❌ Something went wrong", ephemeral: true });
    }
  }
});

// --------------------
client.once("ready", () => console.log(`Logged in as ${client.user.tag}`));
client.login(token);