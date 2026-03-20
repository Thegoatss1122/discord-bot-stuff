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

// Replace with your own IDs
const CLIENT_ID = "1441541093156982975";
const GUILD_ID = "1385650154832662688";

// Replace with your Wispbyte URL
const WISPB_URL = "https://your-wispbyte-url.com";

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
const prefix = "!";

client.on("messageCreate", msg => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;

  const command = msg.content.slice(prefix.length).trim().toLowerCase();

  if (command === "ping") {
    msg.reply("🏓 Pong!!!");
  }
});

// --------------------
// SLASH COMMANDS
// --------------------
const commands = [
  new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Sends a random meme 😂")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("monke")
    .setDescription("Sends a random monkey 🐒")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8ball a question!")
    .addStringOption(option =>
      option.setName("question")
            .setDescription("Your question to the 8ball")
            .setRequired(true)
    )
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(token);

// Register commands
(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Slash commands registered!");
  } catch (error) {
    console.error(error);
  }
})();

// --------------------
// INTERACTION HANDLER (NO TYPING)
// --------------------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    // ===== MEME COMMAND =====
    if (interaction.commandName === "meme") {
      const res = await axios.get("https://www.reddit.com/r/memes/top.json?limit=50&t=week");
      const posts = res.data.data.children;

      const images = posts.filter(p => 
        !p.data.over_18 &&
        (p.data.url.endsWith(".jpg") || p.data.url.endsWith(".png") || p.data.url.endsWith(".gif"))
      );

      if (!images.length) throw new Error("No memes found.");

      const meme = images[Math.floor(Math.random() * images.length)].data;

      const embed = new EmbedBuilder()
        .setTitle(meme.title)
        .setURL(`https://reddit.com${meme.permalink}`)
        .setImage(meme.url)
        .setColor(0xff0000)
        .setFooter({ text: `👍 ${meme.ups} | 💬 ${meme.num_comments}` });

      await interaction.reply({ embeds: [embed] }); // reply once, no typing animation
    }

    // ===== MONKE COMMAND =====
    if (interaction.commandName === "monke") {
      const monkeys = [
        "https://i.redd.it/thinking-monkey-720p-upscale-of-480p-original-with-v0-wsdgkqzj6rlf1.png?width=1080&format=png&auto=webp&s=4b7a7613f46ebcb8b177859a696532c806ec3221",
        "https://i.pinimg.com/avif/1200x/5c/81/6b/5c816b2bbab0f824686a6c446e2eaa72.avf",
        "https://i.pinimg.com/736x/1a/6f/f2/1a6ff2c75346f6670872231ac8c8c728.jpg",
        "https://i.pinimg.com/736x/c0/d1/b5/c0d1b5920d474e1a702ca680039bb07e.jpg",
        "https://i.pinimg.com/1200x/4d/70/f4/4d70f4962981b8b6f06f1874da87209a.jpg",
        "https://i.pinimg.com/736x/f0/cb/00/f0cb0024df9a8fa950aac66295b10cb0.jpg",
        "https://i.pinimg.com/avif/736x/c0/b1/d4/c0b1d40fb378ca551208bd50a2c412b8.avf",
        "https://i.pinimg.com/avif/736x/df/d1/e6/dfd1e6e4dde79cc02a1b52a3dfbc364c.avf",
        "https://i.pinimg.com/736x/c0/d1/b5/c0d1b5920d474e1a702ca680039bb07e.jpg",
        "https://i.pinimg.com/avif/1200x/6c/6b/a2/6c6ba2de9dff4774872916fefa407c8d.avf"
      ];

      const imageUrl = monkeys[Math.floor(Math.random() * monkeys.length)];

      const embed = new EmbedBuilder()
        .setTitle("🐒 Random Monkey!")
        .setImage(imageUrl)
        .setColor(0x00ff00);

      await interaction.reply({ embeds: [embed] });
    }

    // ===== 8BALL COMMAND =====
    if (interaction.commandName === "8ball") {
      const question = interaction.options.getString("question");

      const answers = [
        "🎱 Yes, definitely!",
        "🎱 It is certain.",
        "🎱 Most likely.",
        "🎱 Ask again later.",
        "🎱 Cannot predict now.",
        "🎱 Don't count on it.",
        "🎱 Very doubtful.",
        "🎱 My sources say no.",
        "🎱 Outlook not so good.",
        "🎱 Signs point to yes."
      ];

      const response = answers[Math.floor(Math.random() * answers.length)];

      await interaction.reply({
        content: `**Question:** ${question}\n**8Ball says:** ${response}`
      });
    }

  } catch (error) {
    console.error(error);
    if (interaction.replied) {
      await interaction.editReply({
        content: `❌ Something went wrong: ${error.message}`
      });
    } else {
      await interaction.reply({
        content: `❌ Something went wrong: ${error.message}`,
        ephemeral: true
      });
    }
  }
});

// --------------------
// WISPBYTE STATUS MIRROR
// --------------------
setInterval(async () => {
  if (!client.user) return;

  try {
    await axios.get(WISPB_URL, { timeout: 5000 });
    client.user.setStatus("online");
  } catch {
    client.user.setStatus("invisible"); // bot appears offline if Wispbyte is down
  }
}, 30000);

// Initial status check
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  axios.get(WISPB_URL, { timeout: 5000 })
    .then(() => client.user.setStatus("online"))
    .catch(() => client.user.setStatus("invisible"));
});

// LOGIN
client.login(token);