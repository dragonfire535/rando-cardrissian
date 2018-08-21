const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = class DeckManager extends Collection {
	constructor(iterable) {
		super(iterable);

		this.cache = null;
	}

	register(filePath) {
		const dir = fs.readdirSync(filePath);
		for (const file of dir) {
			const deck = require(path.join(filePath, file));
			this.set(deck.id, deck);
		}
		return this;
	}

	generate(blacklist) {
		if (this.cache && !blacklist.length) return this.cache;
		const filtered = this.filter(deck => !blacklist.includes(deck.id) && deck.id !== 'apples');
		const blackCards = [];
		const whiteCards = [];
		for (const deck of filtered.values()) {
			if (deck.blackCards.length) blackCards.push(...deck.blackCards);
			if (deck.whiteCards.length) whiteCards.push(...deck.whiteCards);
		}
		const result = { blackCards, whiteCards };
		if (!this.cache && !blacklist.length) this.cache = result;
		return result;
	}
};
