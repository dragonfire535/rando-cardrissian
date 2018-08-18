const { stripIndents } = require('common-tags');
const { escapeMarkdown } = require('discord.js');

module.exports = class Player {
	constructor(user) {
		this.id = user.id;
		this.user = user;
		this.points = 0;
		this.hand = new Set();
		this.strikes = 0;
	}

	dealHand(deck) {
		if (this.hand.size > 9) return this.hand;
		const drawCount = 10 - this.hand.size;
		for (let i = 0; i < drawCount; i++) this.hand.add(deck.draw());
		return this.hand;
	}

	get kickable() {
		return this.strikes >= 3;
	}

	kick(players, czars) {
		players.delete(this.id);
		czars.splice(czars.indexOf(this.id), 1);
	}

	async turn(channel, czar, black, deck, chosenCards) {
		if (this.user.id === czar.user.id) return;
		this.dealHand(deck);
		try {
			const extra = await this.chooseCards(czar, black, deck, chosenCards);
			await this.user.send(`Nice! Return to ${channel} to await the results!`);
			return extra;
		} catch (err) {
			return; // eslint-disable-line no-useless-return
		}
	}

	async chooseCards(czar, black, deck, chosenCards) {
		let hand = Array.from(this.hand);
		if (this.user.bot) {
			const chosen = [];
			for (let i = 0; i < black.pick; i++) {
				const valid = hand.filter(card => !chosen.includes(card));
				chosen.push(valid[Math.floor(Math.random() * valid.length)]);
			}
			if (chosen.includes('<Blank>')) {
				const handled = await deck.handleBlank(this);
				chosen[chosen.indexOf('<Blank>')] = handled;
			}
			for (const card of chosen) this.hand.delete(card);
			chosenCards.push({ id: this.id, cards: chosen });
			return null;
		}
		const chosen = [];
		await this.sendHand(hand, czar, black);
		let gambled = false;
		let swapped = false;
		const collector = this.user.dmChannel.createMessageCollector(res => {
			if (res.content.toLowerCase() === 'swap' && this.points > 0 && !swapped) return true;
			if (res.content.toLowerCase() === 'gamble' && this.points > 0 && !gambled) return true;
			const existing = hand[Number.parseInt(res.content, 10) - 1];
			if (!existing) return false;
			if (chosen.includes(existing)) return false;
			chosen.push(existing);
			return true;
		}, { time: 60000 });
		collector.on('collect', async msg => {
			if (msg.content.toLowerCase() === 'swap') {
				await this.user.send('Swapping cards...');
				for (const card of this.hand) this.hand.delete(card);
				this.dealHand(deck);
				hand = Array.from(this.hand);
				this.points--;
				swapped = true;
				await this.sendHand(hand, czar, black);
				return;
			}
			if (msg.content.toLowerCase() === 'gamble') {
				await this.user.send(`You may now play **${black.pick * 2}** cards!`);
				this.points--;
				gambled = true;
				return;
			}
			if (chosen.length >= black.pick * (gambled ? 2 : 1)) collector.stop();
		});
		return new Promise(resolve => collector.once('end', async () => {
			if (chosen.length < black.pick * (gambled ? 2 : 1)) {
				const count = black.pick - chosen.length;
				for (let i = 0; i < count; i++) {
					const valid = hand.filter(card => !chosen.includes(card));
					chosen.push(valid[Math.floor(Math.random() * valid.length)]);
				}
				this.strikes++;
			}
			if (chosen.includes('<Blank>')) {
				const handled = await deck.handleBlank(this);
				chosen[chosen.indexOf('<Blank>')] = handled;
			}
			for (const card of chosen) this.hand.delete(card);
			if (gambled) {
				const first = chosen.splice(0, chosen.length / 2);
				chosenCards.push({ id: this.id, cards: first });
				chosenCards.push({ id: this.id, cards: chosen });
			} else {
				chosenCards.push({ id: this.id, cards: chosen });
			}
			return resolve(gambled ? 1 : 0);
		}));
	}

	sendHand(hand, czar, black) {
		return this.user.send(stripIndents`
			__**Your hand is**__:
			${hand.map((card, i) => `**${i + 1}.** ${card}`).join('\n')}

			**Black Card**: ${escapeMarkdown(black.text)}
			**Card Czar**: ${czar.user.username}
			**Your Points**: ${this.points}

			Pick **${black.pick}** card${black.pick > 1 ? 's' : ''}!
			_Type \`gamble\` to exchange a point for an extra play._
			_Type \`swap\` to exchange a point for a new hand._
		`);
	}
};
