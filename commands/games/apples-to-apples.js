const { Command, Argument } = require('discord-akairo');
const { escapeMarkdown } = require('discord.js');
const { stripIndents } = require('common-tags');
const { shuffle } = require('../../util/Util');
const Game = require('../../structures/Game');
const { greenCards, redCards } = require('../../assets/json/apples-to-apples');

module.exports = class ApplesToApplesCommand extends Command {
	constructor() {
		super('apples-to-apples', {
			aliases: ['apples-to-apples', 'a2a'],
			category: 'games',
			description: 'Compete to see who can come up with the best card to match an adjective.',
			channel: 'guild',
			clientPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			args: [
				{
					id: 'maxPts',
					prompt: {
						start: 'What amount of awesome points should determine the winner?',
						retry: 'You provided an invalid awesome points maximum. Please try again.'
					},
					type: Argument.range('integer', 1, 20, true)
				},
				{
					id: 'noMidJoin',
					match: 'flag',
					flag: ['--no-mid-join', '-nmj']
				},
				{
					id: 'bot',
					match: 'flag',
					flag: ['--bot', '--rando', '-b']
				}
			]
		});
	}

	async exec(msg, { maxPts, noMidJoin, bot }) {
		if (this.client.games.has(msg.channel.id)) return msg.util.reply('Only one game may be occurring per channel.');
		this.client.games.set(msg.channel.id, new Game(msg.channel, redCards, greenCards, 'Green'));
		const game = this.client.games.get(msg.channel.id);
		try {
			const awaitedPlayers = await game.awaitPlayers(msg, bot ? this.client.user : null);
			if (!awaitedPlayers) {
				this.client.games.delete(msg.channel.id);
				return msg.util.sendNew('Game could not be started...');
			}
			if (!noMidJoin) game.createJoinLeaveCollector(msg.channel, game);
			while (!game.winner) {
				const czar = game.changeCzar();
				for (const player of game.players) {
					if (player.id === czar.id) continue;
					if (player.kickable) game.kick(player);
				}
				if (game.players.size < 3) {
					await msg.util.sendNew('Oh... It looks like everyone left...');
					break;
				}
				const green = game.blackDeck.draw();
				await msg.util.sendNew(stripIndents`
					The card czar will be ${czar.user}!
					The Green Card is: **${escapeMarkdown(green.text)}**

					Sending DMs...
				`);
				const chosenCards = [];
				const turns = await Promise.all(game.players.map(player => player.turn(green, chosenCards)));
				const extra = turns.reduce((a, b) => a + b);
				if (!chosenCards.length) {
					await msg.util.sendNew('Hmm... No one even tried.');
					continue;
				}
				const cards = shuffle(chosenCards);
				await msg.util.sendNew(stripIndents`
					${czar.user}, which card${green.pick > 1 ? 's' : ''} do you pick?
					**Green Card**: ${escapeMarkdown(green.text)}

					${cards.map((card, i) => `**${i + 1}.** ${card.cards.join(', ')}`).join('\n')}
				`);
				const filter = res => {
					if (res.author.id !== czar.user.id) return false;
					if (!/^[0-9]+$/g.test(res.content)) return false;
					if (!cards[Number.parseInt(res.content, 10) - 1]) return false;
					return true;
				};
				const chosen = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 120000
				});
				if (!chosen.size) {
					await msg.util.sendNew('Hmm... No one wins. Dealing back cards...');
					for (const pick of cards) {
						for (const card of pick.cards) game.players.get(pick.id).hand.add(card);
					}
					game.czar.strikes++;
					continue;
				}
				const player = game.players.get(cards[Number.parseInt(chosen.first().content, 10) - 1].id);
				if (!player) {
					await msg.util.sendNew('Oh no, I think that player left! No awesome points will be awarded...');
					continue;
				}
				player.points += 1 + extra;
				if (player.points >= maxPts) {
					game.winner = player.user;
				} else {
					const addS = player.points > 1 ? 's' : '';
					await msg.util.sendNew(`Nice, ${player.user}! You now have **${player.points}** awesome point${addS}!`);
				}
			}
			game.stopJoinLeaveCollector();
			this.client.games.delete(msg.channel.id);
			if (!game.winner) return msg.util.sendNew('See you next time!');
			return msg.util.sendNew(`And the winner is... ${game.winner}! Great job!`);
		} catch (err) {
			this.client.games.delete(msg.channel.id);
			game.stopJoinLeaveCollector();
			return msg.util.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
