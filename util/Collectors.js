const { stripIndents } = require('common-tags');
const Player = require('../structures/Player');
const { SUCCESS_EMOJI_ID, FAILURE_EMOJI_ID } = process.env;

module.exports = class CollectorsUtil {
	static async awaitPlayers(msg, max, min, { text = 'join game', time = 30000, dmCheck = false } = {}) {
		const joined = [];
		joined.push(msg.author.id);
		const filter = res => {
			if (res.author.bot) return false;
			if (joined.includes(res.author.id)) return false;
			if (res.content.toLowerCase() !== text.toLowerCase()) return false;
			joined.push(res.author.id);
			res.react(SUCCESS_EMOJI_ID || '✅').catch(() => null);
			return true;
		};
		const verify = await msg.channel.awaitMessages(filter, { max, time });
		verify.set(msg.id, msg);
		if (dmCheck) {
			for (const message of verify.values()) {
				try {
					await message.author.send('Hi! Just testing that DMs work, pay this no mind.');
				} catch (err) {
					verify.delete(message.id);
				}
			}
		}
		if (verify.size < min) return false;
		return verify.map(message => message.author);
	}

	static createJoinLeaveCollector(channel, players, czars, whiteDeck) {
		const collector = channel.createMessageCollector(res => {
			if (res.author.bot) return false;
			if (players.has(res.author.id) && res.content.toLowerCase() !== 'leave game') return false;
			if (czars[0] === res.author.id || players.size >= 10) {
				res.react(FAILURE_EMOJI_ID || '❌').catch(() => null);
				return false;
			}
			if (!['join game', 'leave game'].includes(res.content.toLowerCase())) return false;
			res.react(SUCCESS_EMOJI_ID || '✅').catch(() => null);
			return true;
		});
		collector.on('collect', msg => {
			if (msg.content.toLowerCase() === 'join game') {
				const player = new Player(msg.author);
				player.dealHand(whiteDeck);
				players.set(player.id, player);
				czars.push(player.id);
			} else if (msg.content.toLowerCase() === 'leave game') {
				players.get(msg.author.id).kick(players, czars);
			}
		});
		return collector;
	}

	static createLeaderboardCollector(channel, players) {
		const collector = channel.createMessageCollector(res => {
			if (res.author.bot) return false;
			if (!players.has(res.author.id)) return false;
			if (res.content.toLowerCase() !== 'leaderboard') return false;
			return true;
		});
		collector.on('collect', msg => {
			let i = 0;
			let previousPts = null;
			let positionsMoved = 1;
			const board = players.sort((a, b) => b.points - a.points).map(player => {
				if (previousPts === player.points) {
					positionsMoved++;
				} else {
					i += positionsMoved;
					positionsMoved = 1;
				}
				previousPts = player.points;
				return `**${i}.** ${player.user.tag} (${player.points})`;
			});
			msg.reply(stripIndents`
				**Leaderboard**:
				${board.join('\n')}
			`).catch(() => null);
		});
		return collector;
	}
};
