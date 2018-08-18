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
};
