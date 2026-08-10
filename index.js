require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
} = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const BASE = 'https://dsc.wilkingames.net/api';
const COLOR = 0xD83200;

function formatNum(n) {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString('en-US');
}

function calcKD(kills, deaths) {
  if (!deaths) return kills > 0 ? kills.toFixed(2) : '0.00';
  return (kills / deaths).toFixed(2);
}

function truncate(str, max = 1000) {
  if (!str) return '';
  str = String(str);
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const text = await res.text();
  if (!text || text.trim() === '') return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // for plain string responses like beta version
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('Deadswitch Combat API', { type: ActivityType.Watching });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;
  await interaction.deferReply();

  try {
    if (cmd === 'playerdata') {
      const username = interaction.options.getString('username').trim();
      const data = await fetchJSON(`${BASE}/getPlayer?username=${encodeURIComponent(username)}`);
      const player = data?.profile;

      if (!player || !player.name) {
        return interaction.editReply({
          embeds: [new EmbedBuilder().setColor(COLOR).setTitle('Player not found')
            .setDescription(`No player found with username \`${username}\`.`)],
        });
      }

      const stats = player.stats || {};
      const kills = stats.kills || 0;
      const deaths = stats.deaths || 0;

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(player.name)
        .setDescription(`**Username:** \`${data.username || username}\``)
        .addFields(
          { name: 'Rank', value: `Level **${player.level || 0}**${player.prestige > 0 ? ` • Prestige **${player.prestige}**` : ''}`, inline: true },
          { name: 'XP', value: `${formatNum(player.xp)} / ${formatNum(player.totalXP || player.xp)}`, inline: true },
          { name: 'Credits', value: formatNum(player.credits), inline: true },
          {
            name: 'Combat Stats',
            value: [
              `Kills: **${formatNum(kills)}**`,
              `Deaths: **${formatNum(deaths)}**`,
              `K/D: **${calcKD(kills, deaths)}**`,
              `Headshots: **${formatNum(stats.headshots)}**`,
              `Assists: **${formatNum(stats.assists)}**`,
              `Highest Killstreak: **${formatNum(stats.highest_killstreak)}**`,
              `Highest Multi-kill: **${formatNum(stats.highest_multi_kill)}**`,
              `Longshots: **${formatNum(stats.longshots)}**`,
              `Melees: **${formatNum(stats.melees)}**`,
            ].join('\n'),
            inline: true,
          },
          {
            name: 'Match Stats',
            value: [
              `Wins: **${formatNum(stats.wins)}**`,
              `Losses: **${formatNum(stats.losses)}**`,
              `Games: **${formatNum(stats.games)}**`,
              `MVPs: **${formatNum(stats.mvps)}**`,
              `First Bloods: **${formatNum(stats.first_bloods)}**`,
              `Revives: **${formatNum(stats.revives)}**`,
              `Self Revives: **${formatNum(stats.self_revives)}**`,
            ].join('\n'),
            inline: true,
          },
          {
            name: 'Other Stats',
            value: [
              `Zombie Kills: **${formatNum(stats.zombie_kills)}**`,
              `Infestor Kills: **${formatNum(stats.infestor_kills)}**`,
              `Vehicle / Heli Kills: **${formatNum(stats.helicopter_kills)}**`,
              `Captures: **${formatNum(stats.captures)}**`,
              `Defuses: **${formatNum(stats.defuses)}**`,
              `Plants: **${formatNum(stats.plants)}**`,
              `Support Items Used: **${formatNum(stats.support_items_used)}**`,
              `Time Played: **${formatNum(stats.time)}**`,
            ].join('\n'),
            inline: true,
          },
          { name: 'Clan', value: player.clan || 'None', inline: true },
          { name: 'Banned', value: player.bIsBanned ? '**Yes**' : 'No', inline: true },
          { name: 'Callsign', value: player.callsign || 'None', inline: true },
          { name: 'Badge', value: player.badge || 'None', inline: true },
          {
            name: 'Joined',
            value: data.joinDate ? new Date(data.joinDate).toLocaleString() : 'Unknown',
            inline: true,
          },
          {
            name: 'Last Seen',
            value: data.lastModified ? new Date(data.lastModified).toLocaleString() : 'Unknown',
            inline: true,
          }
        )
        .setFooter({ text: 'Deadswitch Combat API • Full profile' })
        .setTimestamp();

      if (data.steamID) {
        embed.addFields({ name: 'Steam ID', value: `\`${data.steamID}\``, inline: false });
      }

      // Extra: top weapons owned (if present)
      if (player.weapons && Object.keys(player.weapons).length) {
        const topWeapons = Object.entries(player.weapons)
          .sort((a, b) => (b[1].kills || 0) - (a[1].kills || 0))
          .slice(0, 8)
          .map(([id, w]) => `**${id}**: ${formatNum(w.kills)} kills (${formatNum(w.headshots)} HS)`)
          .join('\n');
        embed.addFields({ name: 'Top Weapons (by kills)', value: topWeapons || 'None', inline: false });
      }

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'topplayers') {
      const stat = interaction.options.getString('stat').trim().toLowerCase();
      const list = await fetchJSON(`${BASE}/getPlayersByStat?stat=${encodeURIComponent(stat)}`);

      if (!Array.isArray(list) || list.length === 0) {
        return interaction.editReply(`No data for stat \`${stat}\`. Try: kills, xp, deaths, wins, headshots, etc.`);
      }

      const fields = list.slice(0, 15).map((p, i) => {
        const prestige = p.prestige > 0 ? ` P${p.prestige}` : '';
        return {
          name: `#${i + 1} ${p.username || p.name || 'Unknown'}`,
          value: `Score: **${formatNum(p.score)}** • Lvl ${p.level}${prestige}${p.clan ? ` • ${p.clan}` : ''}`,
          inline: false,
        };
      });

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(`Top Players by ${stat}`)
        .setDescription(`Showing top ${fields.length} of ${list.length}`)
        .addFields(fields)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'online') {
      const players = await fetchJSON('https://dsc.wilkingames.net/players');
      if (!Array.isArray(players) || players.length === 0) {
        return interaction.editReply({ embeds: [new EmbedBuilder().setColor(COLOR).setDescription('No players currently online.')] });
      }

      players.sort((a, b) => {
        const order = s => (s === 'game' ? 0 : 1);
        return order(a.state) - order(b.state) || (b.level || 0) - (a.level || 0);
      });

      const shown = players.slice(0, 15);
      const fields = shown.map(p => {
        const prestige = p.prestige > 0 ? ` P${p.prestige}` : '';
        let details = p.state === 'game' ? '**In Game**' : 'In Menu';
        if (p.serverName) details += ` — ${p.serverName.replace(/\[.*?\]/g, '').trim()}`;
        if (p.gameModeId) details += ` — ${p.gameModeId.replace(/_/g, ' ')}`;
        if (p.mapName) details += ` (${p.mapName})`;
        return {
          name: `${p.name || p.username} (Lvl ${p.level}${prestige})`,
          value: details + (p.clan ? `\nClan: ${p.clan}` : ''),
          inline: false,
        };
      });

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(`Online Players (${players.length})`)
        .setDescription(players.length > 15 ? `Showing 15 of ${players.length}` : null)
        .addFields(fields)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'isbanned') {
      const id = interaction.options.getString('id').trim();
      const result = await fetchJSON(`${BASE}/isBanned?id=${encodeURIComponent(id)}`);
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLOR).setTitle('Ban Check')
          .setDescription(`ID \`${id}\` is **${result ? 'BANNED' : 'not banned'}**.`)],
      });
    }

    if (cmd === 'isadmin') {
      const username = interaction.options.getString('username').trim();
      const result = await fetchJSON(`${BASE}/isAdmin?username=${encodeURIComponent(username)}`);
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLOR).setTitle('Admin Check')
          .setDescription(`\`${username}\` is **${result ? 'an Admin' : 'not an Admin'}**.`)],
      });
    }

    if (cmd === 'ismoderator') {
      const username = interaction.options.getString('username').trim();
      const result = await fetchJSON(`${BASE}/isModerator?username=${encodeURIComponent(username)}`);
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLOR).setTitle('Moderator Check')
          .setDescription(`\`${username}\` is **${result ? 'a Moderator' : 'not a Moderator'}**.`)],
      });
    }

    if (cmd === 'weapon') {
      const id = interaction.options.getString('id').trim().toLowerCase();
      const w = await fetchJSON(`${BASE}/getWeapon?id=${encodeURIComponent(id)}`);

      if (!w || !w.id) {
        return interaction.editReply(`Weapon \`${id}\` not found.`);
      }

      const fields = Object.entries(w)
        .filter(([k, v]) => v != null && k !== 'anims')
        .map(([k, v]) => ({
          name: k,
          value: typeof v === 'object' ? JSON.stringify(v) : String(v),
          inline: true,
        }));

      // Add anims separately if present
      if (w.anims) {
        fields.push({ name: 'anims', value: JSON.stringify(w.anims), inline: false });
      }

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(`${w.name || w.id}`)
        .setDescription(`ID: \`${w.id}\` • Type: **${w.type || 'unknown'}**`)
        .addFields(fields.slice(0, 24))
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'weapons') {
      const list = await fetchJSON(`${BASE}/getWeapons`);
      if (!Array.isArray(list)) return interaction.editReply('Failed to load weapons.');

      const byType = {};
      list.forEach(w => {
        const t = w.type || 'unknown';
        byType[t] = (byType[t] || 0) + 1;
      });

      const typeText = Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .map(([t, c]) => `**${t}**: ${c}`)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(`All Weapons (${list.length})`)
        .setDescription('Use `/weapon <id>` for full details on any weapon.\n\n**Count by type:**\n' + typeText)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'topweapons') {
      const stat = interaction.options.getString('stat').trim().toLowerCase();
      const list = await fetchJSON(`${BASE}/getTopWeaponsByStat?stat=${encodeURIComponent(stat)}`);

      if (!Array.isArray(list) || list.length === 0) {
        return interaction.editReply(`No data for weapon stat \`${stat}\`. Try \`kills\`.`);
      }

      const lines = list.slice(0, 20).map((entry, i) => {
        const name = entry.weapon || entry.id || 'Unknown';
        const total = entry.total ?? entry.score ?? 0;
        return `**#${i + 1} ${name}** — ${formatNum(total)}`;
      });

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(`Top Weapons by ${stat}`)
        .setDescription(lines.join('\n'))
        .setFooter({ text: `Showing ${Math.min(20, list.length)} of ${list.length}` })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'weaponskins') {
      const data = await fetchJSON(`${BASE}/getWeaponSkins`);
      if (!data || typeof data !== 'object') return interaction.editReply('Failed to load skins.');

      const weapons = Object.keys(data);
      const totalSkins = Object.values(data).reduce((sum, arr) => sum + (arr?.length || 0), 0);

      // Show weapons with most skins
      const sorted = Object.entries(data)
        .sort((a, b) => (b[1]?.length || 0) - (a[1]?.length || 0))
        .slice(0, 15);

      const lines = sorted.map(([w, skins]) => `**${w}**: ${skins.length} skins`);

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle('Weapon Skins Overview')
        .setDescription(`**${weapons.length}** weapons • **${totalSkins}** total skins\n\nWeapons with most skins:\n${lines.join('\n')}\n\nUse \`/skinsforweapon <id>\` for a specific weapon.`)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'skinsforweapon') {
      const id = interaction.options.getString('id').trim().toLowerCase();
      const skins = await fetchJSON(`${BASE}/getSkinsForWeapon?id=${encodeURIComponent(id)}`);

      if (!Array.isArray(skins) || skins.length === 0) {
        return interaction.editReply(`No skins found for weapon \`${id}\`.`);
      }

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(`Skins for ${id}`)
        .setDescription(skins.map(s => `\`${s}\``).join(', '))
        .setFooter({ text: `${skins.length} skins` })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'attachment') {
      const id = interaction.options.getString('id').trim();
      const a = await fetchJSON(`${BASE}/getAttachment?id=${encodeURIComponent(id)}`);

      if (!a || !a.id) {
        return interaction.editReply(`Attachment \`${id}\` not found.`);
      }

      const fields = Object.entries(a).map(([k, v]) => ({
        name: k,
        value: String(v ?? 'null'),
        inline: true,
      }));

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(a.name || a.id)
        .setDescription(`ID: \`${a.id}\``)
        .addFields(fields)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'attachments') {
      const list = await fetchJSON(`${BASE}/getAttachments`);
      if (!Array.isArray(list)) return interaction.editReply('Failed to load attachments.');

      const byType = {};
      list.forEach(a => {
        const t = a.type || 'unknown';
        byType[t] = (byType[t] || 0) + 1;
      });

      const typeText = Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .map(([t, c]) => `**${t}**: ${c}`)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(`All Attachments (${list.length})`)
        .setDescription('Use `/attachment <id>` for full details.\n\n**Count by type:**\n' + typeText)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'servers') {
      const list = await fetchJSON(`${BASE}/getServers`);
      if (!Array.isArray(list)) return interaction.editReply('Failed to load servers.');

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(`Servers (${list.length})`)
        .setDescription(list.map((url, i) => `**${i + 1}.** \`${url}\``).join('\n') || 'None')
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    if (cmd === 'isofficialserver') {
      const url = interaction.options.getString('url').trim();
      const result = await fetchJSON(`${BASE}/isOfficialServer?url=${encodeURIComponent(url)}`);
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLOR).setTitle('Official Server Check')
          .setDescription(`\`${url}\` is **${result ? 'an official server' : 'not an official server'}**.`)],
      });
    }

    if (cmd === 'betaversion') {
      const version = await fetchJSON(`${BASE}/getActiveBetaVersion`);
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(COLOR).setTitle('Active Beta Version')
          .setDescription(`**${version || 'Unknown'}**`)],
      });
    }

  } catch (err) {
    console.error(err);
    await interaction.editReply({
      content: `Error: ${err.message || 'Something went wrong while contacting the API.'}`,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
