const { Command } = require('discord-akairo');

module.exports = class DeckListCommand extends Command {
	constructor() {
		super('deck-list', {
			aliases: ['deck-list', 'decks'],
			category: 'other',
			description: 'Responds with a list of all decks.'
		});
	}

	exec(msg) {
		return msg.util.send(this.client.decks.map(deck => `${deck.name} (${deck.id})`).join(', '));
	}
};
