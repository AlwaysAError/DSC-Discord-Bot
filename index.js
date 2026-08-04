require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const API_URL = 'https://dsc.wilkingames.net/api/getPlayer';

function formatNumber(num) {
  if (num == null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
}

function calcKD(kills, deaths) {
  if (!deaths || deaths === 0) return kills > 0 ? kills.toFixed(2) : '0.00';
  return (kills / deaths).toFixed(2);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('Deadswitch Combat', { type: ActivityType.Playing });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'playerdata') return;

  const username = interaction.options.getString('username').trim();

  await interaction.deferReply();

  try {
    const res = await fetch(
      `${API_URL}?username=${encodeURIComponent(username)}`
    );

    if (!res.ok) {
      return interaction.editReply({
        content: `API error (${res.status}). Please try again later.`,
      });
    }

    const data = await res.json();

    const player = data?.profile;

    if (!player || !player.name) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xD83200)
            .setTitle('Player not found')
            .setDescription(`No player found with username \`${username}\`.`)
            .setTimestamp(),
        ],
      });
    }

    const stats = player.stats || {};
    const kills = stats.kills || 0;
    const deaths = stats.deaths || 0;
    const kd = calcKD(kills, deaths);

    const joinDate = data.joinDate
      ? new Date(data.joinDate).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'Unknown';

    const lastSeen = data.lastModified
      ? new Date(data.lastModified).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'Unknown';

    const prestigeText =
      player.prestige > 0 ? ` • Prestige ${player.prestige}` : '';

    const embed = new EmbedBuilder()
      .setColor(0xD83200) // Deadswitch-ish orange/red
      .setTitle(`${player.name}`)
      .setDescription(`Username: \`${data.username || username}\``)
      .addFields(
        {
          name: 'Rank',
          value: `Level **${player.level || 0}**${prestigeText}`,
          inline: true,
        },
        {
          name: 'XP',
          value: `${formatNumber(player.xp)} / ${formatNumber(player.totalXP || player.xp)}`,
          inline: true,
        },
        {
          name: 'Credits',
          value: formatNumber(player.credits),
          inline: true,
        },
        {
          name: 'Combat',
          value: [
            `Kills: **${formatNumber(kills)}**`,
            `Deaths: **${formatNumber(deaths)}**`,
            `K/D: **${kd}**`,
            `Headshots: **${formatNumber(stats.headshots || 0)}**`,
            `Highest Killstreak: **${formatNumber(stats.highest_killstreak || 0)}**`,
          ].join('\n'),
          inline: true,
        },
        {
          name: 'Matches',
          value: [
            `Wins: **${formatNumber(stats.wins || 0)}**`,
            `Losses: **${formatNumber(stats.losses || 0)}**`,
            `Games: **${formatNumber(stats.games || 0)}**`,
            `MVPs: **${formatNumber(stats.mvps || 0)}**`,
          ].join('\n'),
          inline: true,
        },
        {
          name: 'Other',
          value: [
            `Assists: **${formatNumber(stats.assists || 0)}**`,
            `Revives: **${formatNumber(stats.revives || 0)}**`,
            `Zombie Kills: **${formatNumber(stats.zombie_kills || 0)}**`,
          ].join('\n'),
          inline: true,
        },
        {
          name: 'Clan',
          value: player.clan || 'None',
          inline: true,
        },
        {
          name: 'Banned',
          value: player.bIsBanned ? 'Yes' : 'No',
          inline: true,
        },
        {
          name: 'Callsign ID',
          value: player.callsign || 'None',
          inline: true,
        },
        {
          name: 'Joined',
          value: joinDate,
          inline: true,
        },
        {
          name: 'Last Seen',
          value: lastSeen,
          inline: true,
        }
      )
      .setFooter({ text: 'Deadswitch Combat API' })
      .setTimestamp();

    if (data.steamID) {
      embed.addFields({
        name: 'Steam ID',
        value: `\`${data.steamID}\``,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply({
      content: 'Something went wrong while fetching player data. Please try again later.',
    });
  }
});

client.login(process.env.DISCORD_TOKEN);