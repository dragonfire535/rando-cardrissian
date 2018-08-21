const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');

module.exports = class DeckListCommand extends Command {
	constructor() {
		super('deck-list', {
			aliases: ['deck-list', 'decks'],
			category: 'other',
			description: 'Responds with a list of all decks.'
		});
	}

	exec(msg) {
		return msg.util.send(stripIndents`
			__**Deck List**__:
			${this.client.decks.map(deck => `${deck.name} (${deck.id})`).join('\n')}
		`);
	}
};
