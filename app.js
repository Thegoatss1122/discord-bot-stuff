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
  "https://i.pinimg.com/1200x/f8/e1/5b/f8e15bcd1a3aba568c14a1afd24810c0.jpg"
];

// --------------------
// GOOFY IMAGES
// --------------------
const goofyMediaURLs = [
  "https://media1.tenor.com/m/EwY2ORle_XAAAAAd/wizard-dance.gif",
  "https://i.pinimg.com/736x/3f/40/e4/3f40e450e87936b1a2830ee1c96ae70a.jpg",
  "https://i.pinimg.com/736x/9f/5d/05/9f5d053772f615da602544e096892f86.jpg",
  "https://i.pinimg.com/736x/19/5a/ed/195aed7b818f826da768722628da005b.jpg"
];
let goofyCache = goofyMediaURLs.map(url => ({ title: "🖼 Goofy Media", url }));

// --------------------
// MEMIFY IMAGES
// --------------------
const memifyImages = [
  "https://i.pinimg.com/736x/71/54/0d/71540d33c1dc92647f434879a1c7db52.jpg",
  "https://i.pinimg.com/736x/c4/f0/8f/c4f08fe25118e1b4f6fb53543e39f4db.jpg",
  "https://i.pinimg.com/736x/62/44/fc/6244fc96dca19d75c77f62e764949323.jpg",
  "https://i.pinimg.com/736x/b4/95/b5/b495b528bb5f4778039e1c23e762e9e7.jpg",
  "https://i.pinimg.com/736x/56/d6/e4/56d6e47b6278b32ecfb9278b9fc79b7d.jpg"
];

// --------------------
// BLACKLIST
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
  memeCache = await buildCache(memeSubs);
  hockeyCache = await buildCache(hockeySubs);
  goalieCache = await buildCache(goalieSubs);
  monkeyCache = await buildCache(monkeySubs);
}
refreshCaches();
setInterval(refreshCaches, 10*60*1000);

// --------------------
// HANGMAN
// --------------------
const hangmanWords = [
  "discord","hockey","banana","javascript","monkey",
  "internet","goalie","galaxy","rocket","pancake"
].filter(w => !w.includes("z"));

const hangmanGames = new Map();

const hangmanStages = [
  "```\n\n\n\n\n=========\n```",
  "```\n |\n |\n |\n |\n=========\n```",
  "```\n +---+\n |\n |\n |\n |\n=========\n```",
  "```\n +---+\n |   O\n |\n |\n |\n=========\n```",
  "```\n +---+\n |   O\n |   |\n |\n |\n=========\n```",
  "```\n +---+\n |   O\n |  /|\\\n |\n |\n=========\n```",
  "```\n +---+\n |   O\n |  /|\\\n |  / \\\n |\n=========\n```"
];

const WIN_GIF = "https://media1.tenor.com/m/EwY2ORle_XAAAAAd/wizard-dance.gif";
const LOSE_GIF = "https://media1.tenor.com/m/-vrZWF9Ly18AAAAd/wet-eggplant.gif";

function getDisplayWord(word, guessed) {
  return word.split("").map(l => (guessed.includes(l) ? l : "_")).join(" ");
}

function createKeyboard(disabled = []) {
  const rows = [];
  const letters = "abcdefghijklmnopqrstuvwxy".split("");

  for (let i = 0; i < 5; i++) {
    const row = new ActionRowBuilder();
    letters.slice(i*5, i*5+5).forEach(l => {
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

// --------------------
// BUILD POST
// --------------------
function buildPost(post) {
  if (!post) return { content: "No content available" };

  if (post.url && /\.(jpg|jpeg|png|gif)$/i.test(post.url)) {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle(post.title || "Image")
          .setImage(post.url)
          .setColor(0x00bfff)
      ]
    };
  }

  return { content: `${post.title || "Post"}\n${post.url || ""}` };
}

// --------------------
// COMMANDS
// --------------------
const commands = [
  new SlashCommandBuilder().setName("meme").setDescription("Trending memes"),
  new SlashCommandBuilder().setName("hockeymemes").setDescription("Hockey memes"),
  new SlashCommandBuilder().setName("hockeygoalies").setDescription("Goalie memes"),
  new SlashCommandBuilder().setName("monke").setDescription("Random monke"),
  new SlashCommandBuilder().setName("goofyimages").setDescription("Goofy media"),
  new SlashCommandBuilder()
    .setName("memify")
    .setDescription("Make a meme")
    .addStringOption(o=>o.setName("text").setRequired(true).setDescription("Text")),
  new SlashCommandBuilder().setName("space").setDescription("Space image"),
  new SlashCommandBuilder().setName("hangman").setDescription("Play hangman")
].map(c=>c.toJSON());

const rest = new REST({version:"10"}).setToken(token);
(async()=>{
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),{body:commands});
})();

// --------------------
// RANDOM
// --------------------
const rand = arr => arr[Math.floor(Math.random()*arr.length)];

// --------------------
// INTERACTIONS
// --------------------
client.on("interactionCreate", async interaction=>{
  try{
    if(interaction.isChatInputCommand()){

      if(interaction.commandName==="memify"){
        const text = interaction.options.getString("text") || "No text";
        const image = rand(memifyImages);

        return interaction.reply({
          embeds:[
            new EmbedBuilder()
              .setTitle("😂 Meme")
              .setDescription(text.toUpperCase())
              .setImage(image)
              .setColor(0xff9900)
          ]
        });
      }

      if(interaction.commandName==="space"){
        const posts = await fetchSub("spaceporn");
        return interaction.reply(buildPost(rand(posts)));
      }

      if(interaction.commandName==="hangman"){
        const word = rand(hangmanWords);
        hangmanGames.set(interaction.user.id,{word,guessed:[],tries:6});

        return interaction.reply({
          embeds:[new EmbedBuilder()
            .setTitle("🎮 Hangman")
            .setDescription(`Word: ${getDisplayWord(word,[])}\n\nTries: 6`)
          ],
          components:createKeyboard()
        });
      }

      let cache = [];
      if(interaction.commandName==="meme") cache=memeCache;
      if(interaction.commandName==="hockeymemes") cache=hockeyCache;
      if(interaction.commandName==="hockeygoalies") cache=goalieCache;
      if(interaction.commandName==="monke") cache=[...monkeyCache,...monkeyImages.map(u=>({url:u}))];
      if(interaction.commandName==="goofyimages") cache=goofyCache;

      return interaction.reply(buildPost(rand(cache)));
    }

    if(interaction.isButton() && interaction.customId.startsWith("hang_")){
      const letter = interaction.customId.split("_")[1];
      const game = hangmanGames.get(interaction.user.id);
      if(!game) return;

      if(!game.guessed.includes(letter)){
        game.guessed.push(letter);
        if(!game.word.includes(letter)) game.tries--;
      }

      const display = getDisplayWord(game.word,game.guessed);
      const stage = hangmanStages[6-game.tries];

      if(!display.includes("_")){
        hangmanGames.delete(interaction.user.id);
        return interaction.update({
          content: WIN_GIF,
          embeds:[new EmbedBuilder()
            .setTitle("🎉 YOU WON!")
            .setDescription(`Word: **${game.word}**\n\n${stage}`)
          ],
          components:[]
        });
      }

      if(game.tries<=0){
        hangmanGames.delete(interaction.user.id);
        return interaction.update({
          content: LOSE_GIF,
          embeds:[new EmbedBuilder()
            .setTitle("💀 YOU LOST!")
            .setDescription(`Word: **${game.word}**\n\n${hangmanStages[6]}`)
          ],
          components:[]
        });
      }

      return interaction.update({
        embeds:[new EmbedBuilder()
          .setTitle("🎮 Hangman")
          .setDescription(`Word: ${display}\n\nTries: ${game.tries}\n\n${stage}`)
        ],
        components:createKeyboard(game.guessed)
      });
    }

  }catch(err){
    console.error(err);
    if(interaction.replied || interaction.deferred){
      interaction.editReply({content:"❌ Error"});
    } else {
      interaction.reply({content:"❌ Error",ephemeral:true});
    }
  }
});

client.once("ready",()=>console.log(`Logged in as ${client.user.tag}`));
client.login(token);