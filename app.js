const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const axios = require("axios");
const config = require("./token.js");

const token = config.DISCORD_TOKEN;
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
// GOOFY IMAGES (Pinterest)
// --------------------
const goofyMediaURLs = [
  "https://i.pinimg.com/originals/95/b6/e4/95b6e46cdf26dfb2e8b898f21d98f912.gif",
  "https://i.pinimg.com/736x/3f/40/e4/3f40e450e87936b1a2830ee1c96ae70a.jpg",
  "https://i.pinimg.com/736x/9f/5d/05/9f5d053772f615da602544e096892f86.jpg",
  "https://i.pinimg.com/736x/19/5a/ed/195aed7b818f826da768722628da005b.jpg",
  "https://i.pinimg.com/1200x/ee/79/83/ee7983129251d2e9cdda5b0a259544aa.jpg",
  "https://i.pinimg.com/736x/d4/f9/d1/d4f9d1bc45feb0b2bd4b6e9c249d1ed8.jpg",
  "https://i.pinimg.com/736x/63/1f/d1/631fd184d4d2aa69affdd6dc47067a73.jpg",
  "https://i.pinimg.com/736x/e0/39/1e/e0391e07fd1b5ff4d5130aaf7009e2c8.jpg",
  "https://i.pinimg.com/736x/fa/f3/d3/faf3d37b8ea5b967aa5ed8e93e383851.jpg",
  "https://i.pinimg.com/1200x/d4/ab/3b/d4ab3b442eda560e704129401feaef66.jpg",
  "https://i.pinimg.com/1200x/f4/0e/01/f40e016b81298d5687f69adf6908472c.jpg",
  "https://i.pinimg.com/1200x/44/e4/3d/44e43dacea15abb8dd8b69c43f703acd.jpg",
  "https://i.pinimg.com/1200x/dd/39/cc/dd39cc6cb741f5582bf7607b3bffd478.jpg",
  "https://i.pinimg.com/736x/f8/ae/8b/f8ae8b34d6c4a9a30c00f5785f9acc13.jpg",
  "https://i.pinimg.com/736x/9a/7c/a0/9a7ca0230a923098342ceb9fb5d676e4.jpg",
  "https://i.pinimg.com/736x/aa/2b/ca/aa2bcae3df8f60e19c705c9825ec5c9b.jpg",
  "https://i.pinimg.com/1200x/5b/94/d8/5b94d832cbdc76a12b4312d3bbf95244.jpg",
  "https://i.pinimg.com/736x/8c/b8/03/8cb80361faa7807061393e3bf562e4a6.jpg",
  "https://i.pinimg.com/736x/3f/0f/06/3f0f065498b5b4fb5b4f1707cfe2602a.jpg",
  "https://i.pinimg.com/736x/9f/11/2a/9f112a0f229629918a8536e9e389d753.jpg",
  "https://i.pinimg.com/736x/f5/0e/87/f50e87a83960068ed1cfd16d6754e7dd.jpg",
  "https://i.pinimg.com/736x/75/71/7b/75717b7917006e18b4f876c7c0a543c0.jpg"
];
let goofyCache = goofyMediaURLs.map(url => ({ title: "🖼 Goofy Media", url }));

// --------------------
// BLACKLIST (allow "ass")
// --------------------
const blacklist = ["nigger","faggot","bitch","cunt","slut","fuck"];
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
  for (const sub of subs) posts.push(...(await fetchSub(sub)));
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
setInterval(refreshCaches, 10*60*1000);

// --------------------
// BUILD POST
// --------------------
function buildPost(post) {
  if (!post) return { content: "No content available" };
  if (post.url && /\.(jpg|jpeg|png|gif)$/i.test(post.url)) {
    return { embeds: [new EmbedBuilder().setTitle(post.title || "🐵 monke").setImage(post.url).setColor(0x00bfff)] };
  }
  return { content: `**${post.title}**\n${post.url}` };
}

// --------------------
// COMMANDS
// --------------------
const commands = [
  new SlashCommandBuilder().setName("meme").setDescription("Trending memes"),
  new SlashCommandBuilder().setName("hockeymemes").setDescription("Trending hockey memes"),
  new SlashCommandBuilder().setName("hockeygoalies").setDescription("Trending goalie memes"),
  new SlashCommandBuilder().setName("monke").setDescription("Random monke 🐵"),
  new SlashCommandBuilder().setName("goofyimages").setDescription("Random funny Pinterest images, GIFs, or videos")
].map(c => c.toJSON());

// --------------------
// REGISTER COMMANDS
// --------------------
const rest = new REST({ version: "10" }).setToken(token);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("✅ Commands registered");
  } catch(err){ console.error(err); }
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
    if (!interaction.isChatInputCommand()) return;

    let cache, post;
    switch(interaction.commandName) {
      case "meme": cache = memeCache; post = rand(cache); break;
      case "hockeymemes": cache = hockeyCache; post = rand(cache); break;
      case "hockeygoalies": cache = goalieCache; post = rand(cache); break;
      case "monke": cache = [...monkeyCache, ...monkeyImages.map(url => ({ title:"🐵 monke", url }))]; post = rand(cache); break;
      case "goofyimages": cache = goofyCache; post = rand(cache); break;
      default: return;
    }

    await interaction.reply(buildPost(post));
  } catch(err){
    console.error("Interaction error:", err);
    if (interaction.deferred || interaction.replied) await interaction.editReply({ content:"❌ Something went wrong" });
    else await interaction.reply({ content:"❌ Something went wrong", ephemeral:true });
  }
});

// --------------------
client.once("ready",()=>console.log(`Logged in as ${client.user.tag}`));
client.login(token);