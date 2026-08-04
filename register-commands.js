require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('playerdata')
    .setDescription('Get Deadswitch Combat player data by username')
    .addStringOption(option =>
      option
        .setName('username')
        .setDescription('The player username')
        .setRequired(true)
    )
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Successfully registered /playerdata');
  } catch (error) {
    console.error(error);
  }
})();