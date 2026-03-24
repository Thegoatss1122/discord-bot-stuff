const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder,
  EmbedBuilder
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

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Prefix Commands
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

const prefix = "!";

client.on('messageCreate', msg => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    msg.reply("🏓 Pong!!!");
  }
});

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Slash Command: /meme
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

const commands = [
  new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Sends a random safe meme from r/memes 😂")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Registering slash command...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Slash command registered!");
  } catch (error) {
    console.error(error);
  }
})();

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "meme") {
    try {
      const res = await axios.get("https://www.reddit.com/r/memes/top.json?limit=50&t=week");
      const posts = res.data.data.children;

      const images = posts.filter(p => 
        !p.data.over_18 && 
        (p.data.url.endsWith(".jpg") || p.data.url.endsWith(".png") || p.data.url.endsWith(".gif"))
      );

      if (!images.length) throw new Error("No safe image posts found.");

      const meme = images[Math.floor(Math.random() * images.length)].data;

      const embed = new EmbedBuilder()
        .setTitle(meme.title)
        .setURL(`https://reddit.com${meme.permalink}`)
        .setImage(meme.url)
        .setFooter({ text: `👍 ${meme.ups} | 💬 ${meme.num_comments}` })
        .setColor(0xff0000);

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.followUp({ 
        content: `❌ An error occurred: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
});

// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
// Ready Event
// ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);
