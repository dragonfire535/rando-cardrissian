const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');

module.exports = class LeaderboardCommand extends Command {
	constructor() {
		super('leaderboard', {
			aliases: ['leaderboard', 'lb'],
			category: 'info',
			description: 'Displays the current leaderboard for this channel\'s game.',
			channel: 'guild'
		});
	}

	exec(msg) {
		const game = this.client.games.get(msg.channel.id);
		if (!game || !game.players.size) return msg.util.send('A game isn\'t being played in this channel...');
		let i = 0;
		let previousPts = null;
		let positionsMoved = 1;
		const board = game.players.sort((a, b) => b.points - a.points).map(player => {
			if (previousPts === player.points) {
				positionsMoved++;
			} else {
				i += positionsMoved;
				positionsMoved = 1;
			}
			previousPts = player.points;
			return `**${i}.** ${player.user.tag} (${player.points})`;
		});
		return msg.util.send(stripIndents`
			__**Leaderboard**__:
			${board.join('\n')}
		`);
	}
};
