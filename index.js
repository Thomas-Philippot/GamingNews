// require('./modules/reddit.js');
// require('./modules/cruxpool.js')

require('dotenv').config()

const fs = require('fs')
const { Client, Collection, Intents} = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Register commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  console.log(`Registered ${command.data.name} command`)
}

// Register events
client.once('ready', () => {
  console.log('Ready!');
});

// event handler for commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.isButton()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
})

// Login to Discord with your client's token
client.login(process.env.TOKEN);
