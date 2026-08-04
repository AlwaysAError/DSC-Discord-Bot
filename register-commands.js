require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  // Players
  new SlashCommandBuilder()
    .setName('playerdata')
    .setDescription('Full player profile from the DSC API')
    .addStringOption(o => o.setName('username').setDescription('Player username').setRequired(true)),

  new SlashCommandBuilder()
    .setName('topplayers')
    .setDescription('Top players ranked by a stat (e.g. kills, xp, deaths, wins, headshots)')
    .addStringOption(o => o.setName('stat').setDescription('Stat name (kills, xp, deaths, wins...)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('online')
    .setDescription('Currently online players'),

  new SlashCommandBuilder()
    .setName('isbanned')
    .setDescription('Check if a player ID is banned')
    .addStringOption(o => o.setName('id').setDescription('Player ID').setRequired(true)),

  new SlashCommandBuilder()
    .setName('isadmin')
    .setDescription('Check if a username is an admin')
    .addStringOption(o => o.setName('username').setDescription('Username').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ismoderator')
    .setDescription('Check if a username is a moderator')
    .addStringOption(o => o.setName('username').setDescription('Username').setRequired(true)),

  // Weapons
  new SlashCommandBuilder()
    .setName('weapon')
    .setDescription('Detailed info for a single weapon')
    .addStringOption(o => o.setName('id').setDescription('Weapon ID (e.g. mp5, ak47, knife)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('weapons')
    .setDescription('List of all weapons (summary by type + count)'),

  new SlashCommandBuilder()
    .setName('topweapons')
    .setDescription('Top weapons ranked by a stat (e.g. kills)')
    .addStringOption(o => o.setName('stat').setDescription('Stat (kills is the most reliable)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('weaponskins')
    .setDescription('All weapon skins overview'),

  new SlashCommandBuilder()
    .setName('skinsforweapon')
    .setDescription('Skins available for a specific weapon')
    .addStringOption(o => o.setName('id').setDescription('Weapon ID').setRequired(true)),

  // Attachments
  new SlashCommandBuilder()
    .setName('attachment')
    .setDescription('Detailed info for a single attachment')
    .addStringOption(o => o.setName('id').setDescription('Attachment ID (e.g. optic0001)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('attachments')
    .setDescription('List of all attachments (summary by type)'),

  // Misc
  new SlashCommandBuilder()
    .setName('servers')
    .setDescription('List of known server URLs'),

  new SlashCommandBuilder()
    .setName('isofficialserver')
    .setDescription('Check if a server URL is official')
    .addStringOption(o => o.setName('url').setDescription('Server URL').setRequired(true)),

  new SlashCommandBuilder()
    .setName('betaversion')
    .setDescription('Current active beta version'),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Registering ${commands.length} slash commands...`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Successfully registered all commands!');
  } catch (error) {
    console.error(error);
  }
})();
