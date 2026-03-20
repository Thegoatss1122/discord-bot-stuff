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
const token = require("./token.js");

const CLIENT_ID = "1441541093156982975";
const GUILD_ID = "1385650154832662688";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// --------------------
// PREFIX COMMAND (!ping)
// --------------------
client.on("messageCreate", msg => {
  if (msg.author.bot) return;
  if (msg.content === "!ping") msg.reply("🏓 Pong!!!");
});

// --------------------
// SLASH COMMANDS
// --------------------
const commands = [
  new SlashCommandBuilder().setName("meme").setDescription("Random meme 😂").toJSON(),
  new SlashCommandBuilder().setName("hockeymemes").setDescription("Random hockey meme 🏒").toJSON(),
  new SlashCommandBuilder().setName("hockeygoalies").setDescription("Goalie memes/videos 🥅").toJSON(),
  new SlashCommandBuilder().setName("monke").setDescription("Random monkey 🐒").toJSON(),
  new SlashCommandBuilder().setName("8ball").setDescription("Ask the magic 8ball!")
    .addStringOption(opt => opt.setName("question").setDescription("Your question").setRequired(true))
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log("Commands registered");
})();

// --------------------
// SUBREDDITS
// --------------------
const memeSubs = ["memes","meme","dankmemes","Random_Memes","Funnymemes","funny","oldmemes"];
const hockeySubs = ["hockeymemes","NHLMemes","Icehockeymemes","hockeygearmemes"];
const goalieSubs = ["hockeygoalies"];

// --------------------
// CACHE
// --------------------
let memeCache = [], hockeyCache = [], goalieCache = [];

// --------------------
// SAFETY FILTER
// --------------------
const bannedWords = ["racist","nazi","hitler","slur"];

function isSafe(post){
  if(post.over_18) return false;
  const text = (post.title + " " + (post.selftext || "")).toLowerCase();
  if(bannedWords.some(word => text.includes(word))) return false;
  if(post.is_video || post.url.match(/\.(jpg|png|gif)$/) || post.url.includes("v.redd.it")) return true;
  return false;
}

// --------------------
// FETCH + CACHE FUNCTIONS
// --------------------
async function fetchSubreddit(sub, type="hot") {
  const res = await axios.get(`https://www.reddit.com/r/${sub}/${type}.json?limit=50`);
  return res.data.data.children.map(p => p.data);
}

async function updateCache(subs, cacheArray){
  let posts = [];
  for(const sub of subs){
    try{
      const fetched = await fetchSubreddit(sub, "hot");
      posts.push(...fetched);
    } catch(err){ console.error(`Failed to fetch ${sub}:`, err.message); }
  }
  cacheArray.length = 0;
  cacheArray.push(...posts.filter(isSafe));
}

// Initial load + interval
updateCache(memeSubs, memeCache);
updateCache(hockeySubs, hockeyCache);
updateCache(goalieSubs, goalieCache);
setInterval(()=>updateCache(memeSubs, memeCache), 10*60*1000);
setInterval(()=>updateCache(hockeySubs, hockeyCache), 10*60*1000);
setInterval(()=>updateCache(goalieSubs, goalieCache), 10*60*1000);

// --------------------
// INTERACTION HANDLER
// --------------------
client.on("interactionCreate", async (interaction) => {
  if(!interaction.isChatInputCommand() && !interaction.isButton()) return;

  try{
    // ===== BUTTONS HANDLER =====
    if(interaction.isButton()){
      const [type] = interaction.customId.split("_");
      let cache;
      if(type==="meme") cache=memeCache;
      if(type==="hockey") cache=hockeyCache;
      if(type==="goalie") cache=goalieCache;

      if(!cache || !cache.length) return interaction.update({ content:"No content yet!", embeds:[], components:[] });

      const post = cache[Math.floor(Math.random()*cache.length)];

      if(post.is_video && post.media?.reddit_video?.fallback_url){
        return interaction.update({ content:`${post.title}\n${post.media.reddit_video.fallback_url}`, embeds:[], components:[interaction.message.components[0]] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle(post.title)
          .setURL(`https://reddit.com${post.permalink}`)
          .setImage(post.url)
          .setColor(type==="meme"?0xff0000:type==="hockey"?0x0099ff:0x00bfff);
        return interaction.update({ content:null, embeds:[embed], components:[interaction.message.components[0]] });
      }
    }

    // ===== TYPING ANIMATION =====
    await interaction.channel.sendTyping();
    await new Promise(r=>setTimeout(r,1000));

    const nextButton = (id)=> new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`${id}_next`).setLabel("Next").setStyle(ButtonStyle.Primary)
    );

    // ===== COMMANDS =====
    if(interaction.commandName==="meme"){
      if(!memeCache.length) return interaction.reply("No memes ready 😢");
      const post = memeCache[Math.floor(Math.random()*memeCache.length)];
      const embed = new EmbedBuilder().setTitle(post.title).setURL(`https://reddit.com${post.permalink}`).setImage(post.url).setColor(0xff0000);
      return interaction.reply({ embeds:[embed], components:[nextButton("meme")] });
    }

    if(interaction.commandName==="hockeymemes"){
      if(!hockeyCache.length) return interaction.reply("No hockey memes 🏒");
      const post = hockeyCache[Math.floor(Math.random()*hockeyCache.length)];
      const embed = new EmbedBuilder().setTitle(post.title).setURL(`https://reddit.com${post.permalink}`).setImage(post.url).setColor(0x0099ff);
      return interaction.reply({ embeds:[embed], components:[nextButton("hockey")] });
    }

    if(interaction.commandName==="hockeygoalies"){
      if(!goalieCache.length) return interaction.reply("No goalie content 🥅");
      const post = goalieCache[Math.floor(Math.random()*goalieCache.length)];
      if(post.is_video && post.media?.reddit_video?.fallback_url){
        return interaction.reply({ content:`${post.title}\n${post.media.reddit_video.fallback_url}`, components:[nextButton("goalie")] });
      } else {
        const embed = new EmbedBuilder().setTitle(post.title).setURL(`https://reddit.com${post.permalink}`).setImage(post.url).setColor(0x00bfff);
        return interaction.reply({ embeds:[embed], components:[nextButton("goalie")] });
      }
    }

    if(interaction.commandName==="monke"){
      const monkeys=[
        "https://i.redd.it/thinking-monkey-720p-upscale.png",
        "https://i.pinimg.com/736x/1a/6f/f2/1a6ff2c75346f6670872231ac8c8c728.jpg"
      ];
      const embed = new EmbedBuilder().setTitle("🐒 Random Monkey!").setImage(monkeys[Math.floor(Math.random()*monkeys.length)]).setColor(0x00ff00);
      return interaction.reply({ embeds:[embed] });
    }

    if(interaction.commandName==="8ball"){
      const q = interaction.options.getString("question");
      const answers = ["Yes","No","Maybe","Ask again later","Definitely","Very doubtful"];
      return interaction.reply({ content:`**Q:** ${q}\n🎱 ${answers[Math.floor(Math.random()*answers.length)]}` });
    }

  } catch(err){
    console.error(err);
    if(!interaction.replied) await interaction.reply({ content:"Error ❌", ephemeral:true });
  }
});

// --------------------
// READY
// --------------------
client.once("ready", ()=>{ console.log(`Logged in as ${client.user.tag}`); });
client.login(token);