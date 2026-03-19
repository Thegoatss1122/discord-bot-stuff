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

// Replace these with your own IDs
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
// PREFIX COMMANDS
// --------------------
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

// --------------------
// SLASH COMMAND: /meme
// --------------------
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
      // Fetch top posts from r/memes for the past week
      const res = await axios.get("https://www.reddit.com/r/memes/top.json?limit=50&t=week");
      const posts = res.data.data.children;

      // Filter only safe image posts
      const images = posts.filter(p => 
        !p.data.over_18 && 
        (p.data.url.endsWith(".jpg") || p.data.url.endsWith(".png") || p.data.url.endsWith(".gif"))
      );

      if (!images.length) throw new Error("No safe image posts found.");

      // Pick a random meme
      const meme = images[Math.floor(Math.random() * images.length)].data;

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(meme.title)
        .setURL(`https://reddit.com${meme.permalink}`)
        .setImage(meme.url)
        .setFooter({ text: `👍 ${meme.ups} | 💬 ${meme.num_comments}` })
        .setColor(0xff0000);

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      // Send ephemeral message to user with error details
      await interaction.followUp({ 
        content: `❌ An error occurred: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
});

// --------------------
// READY
// --------------------
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// LOGIN
client.login(token);