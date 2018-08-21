const { Command } = require('discord-akairo');

module.exports = class DeckListCommand extends Command {
	constructor() {
		super('deck-list', {
			aliases: ['deck-list', 'decks'],
			category: 'other',
			description: 'Responds with a list of all decks, with query.',
			args: [
				{
					id: 'query',
					prompt: {
						start: 'What deck would you like to search for?',
						retry: 'You provided an invalid query. Please try again.',
						optional: true
					},
					default: '',
					type: 'string'
				}
			]
		});
	}

	exec(msg, { query }) {
		const search = query.toLowerCase();
		let results = this.client.decks;
		if (query) results = this.client.decks.filter(d => d.id.includes(search) || d.name.toLowerCase().includes(search));
		return msg.util.send(results.map(deck => `${deck.name} (${deck.id})`).join(', '));
	}
};
