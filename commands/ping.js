const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config()


module.exports = {
  data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Reply with pong'),
  async execute(interaction) {
    await interaction.reply('pong');
  },
};

