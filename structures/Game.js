const { Collection } = require('discord.js');
const Player = require('./Player');
const Deck = require('./Deck');
const { removeFromArray } = require('../util/Util');
const { SUCCESS_EMOJI_ID, FAILURE_EMOJI_ID } = process.env;

module.exports = class Game {
	constructor(channel, whiteCards, blackCards, blackType) {
		this.channel = channel;
		this.players = new Collection();
		this.czars = [];
		this.whiteDeck = new Deck(whiteCards);
		this.blackDeck = new Deck(blackCards);
		this.joinLeaveCollector = null;
		this.winner = null;
		this.blackType = blackType;
	}

	addUser(user) {
		const player = new Player(this, user);
		player.dealHand();
		this.players.set(player.id, player);
		if (!user.bot) this.czars.push(player.id);
		return this.players;
	}

	get czar() {
		return this.players.get(this.czars[0]);
	}

	changeCzar() {
		this.czars.push(this.czars[0]);
		this.czars.shift();
		return this.czar;
	}

	kick(player) {
		this.players.delete(player.id);
		removeFromArray(this.czars, player.id);
	}

	async awaitPlayers(msg, bot) {
		const max = bot ? 9 : 10;
		const min = bot ? 2 : 3;
		await msg.util.sendNew(
			`You will need at least ${min - 1} more player${min - 1 === 1 ? '' : 's'}. To join, type \`join game\`.`
		);
		const joined = [];
		joined.push(msg.author.id);
		const filter = res => {
			if (res.author.bot) return false;
			if (joined.includes(res.author.id)) return false;
			if (res.content.toLowerCase() !== 'join game') return false;
			joined.push(res.author.id);
			res.react(SUCCESS_EMOJI_ID || '✅').catch(() => null);
			return true;
		};
		const verify = await msg.channel.awaitMessages(filter, { max, time: 30000 });
		verify.set(msg.id, msg);
		if (verify.size < min) return false;
		for (const message of verify.values()) this.addUser(message.author);
		if (bot) this.addUser(bot);
		return true;
	}

	createJoinLeaveCollector() {
		const collector = this.channel.createMessageCollector(res => {
			if (res.author.bot) return false;
			if (this.players.has(res.author.id) && res.content.toLowerCase() !== 'leave game') return false;
			if (!this.players.has(res.author.id) && res.content.toLowerCase() !== 'join game') return false;
			if (this.czar.id === res.author.id || this.players.size >= 10) {
				res.react(FAILURE_EMOJI_ID || '❌').catch(() => null);
				return false;
			}
			if (!['join game', 'leave game'].includes(res.content.toLowerCase())) return false;
			res.react(SUCCESS_EMOJI_ID || '✅').catch(() => null);
			return true;
		});
		collector.on('collect', msg => {
			if (msg.content.toLowerCase() === 'join game') this.addUser(msg.author);
			else if (msg.content.toLowerCase() === 'leave game') this.kick(msg.author);
		});
		this.joinLeaveCollector = collector;
		return this.joinLeaveCollector;
	}

	stopJoinLeaveCollector() {
		if (!this.joinLeaveCollector) return null;
		return this.joinLeaveCollector.stop();
	}
};
