const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const { removeFromArray } = require('../util/Util');

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

	generate(blacklist, whitelist) {
		if (this.cache && !blacklist.length && !whitelist.length) return this.cache;
		blacklist = blacklist ? blacklist.split(',') : [];
		whitelist = whitelist ? whitelist.split(',') : [];
		if (blacklist.includes('official')) {
			removeFromArray(blacklist, 'official');
			blacklist.push(...this.officialIDs());
		}
		if (blacklist.includes('custom')) {
			removeFromArray(blacklist, 'custom');
			blacklist.push(...this.officialIDs(true));
		}
		if (whitelist.includes('official')) {
			removeFromArray(whitelist, 'official');
			whitelist.push(...this.officialIDs());
		}
		if (whitelist.includes('custom')) {
			removeFromArray(whitelist, 'custom');
			whitelist.push(...this.officialIDs(true));
		}
		const filtered = this.filter(deck => {
			if (!whitelist.includes('apples') && deck.id === 'apples') return false;
			return whitelist.length ? whitelist.includes(deck.id) : !blacklist.includes(deck.id);
		});
		const blackCards = [];
		const whiteCards = [];
		for (const deck of filtered.values()) {
			if (deck.blackCards.length) blackCards.push(...deck.blackCards);
			if (deck.whiteCards.length) whiteCards.push(...deck.whiteCards);
		}
		const result = { blackCards, whiteCards };
		if (!this.cache && !blacklist.length && !whitelist.length) this.cache = result;
		return result;
	}

	officialIDs(reverse = false) {
		return this.filter(deck => reverse ? !deck.official : deck.offical).map(deck => deck.id);
	}
};
