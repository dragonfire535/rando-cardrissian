const { shuffle } = require('../util/Util');

module.exports = class Deck {
	constructor(cards) {
		this.cards = cards;
		this.deck = shuffle(cards);
	}

	draw() {
		if (!this.deck.length) this.reset();
		const card = this.deck[0];
		this.deck.shift();
		return card;
	}

	reset() {
		this.deck = shuffle(this.cards);
		return this.deck;
	}

	async handleBlank(player) {
		player.hand.delete('<Blank>');
		if (player.user.bot) return 'Rando Cardissian.';
		await player.user.send('What do you want the blank card to say? Must be 100 or less characters.');
		const blank = await player.user.dmChannel.awaitMessages(res => res.content.length <= 100, {
			max: 1,
			time: 60000
		});
		if (!blank.size) return `A blank card ${player.user.tag} forgot to fill out.`;
		return blank.first().content;
	}
};
