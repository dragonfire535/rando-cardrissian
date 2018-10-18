const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');

module.exports = class DeckListCommand extends Command {
	constructor() {
		super('deck-list', {
			aliases: ['deck-list', 'decks'],
			category: 'info',
			description: 'Responds with a list of all decks based on your query.',
			args: [
				{
					id: 'query',
					prompt: {
						start: 'What deck would you like to search for?',
						retry: 'You provided an invalid query. Please try again.'
					},
					type: 'string'
				}
			]
		});
	}

	exec(msg, { query }) {
		const search = query.toLowerCase();
		let results = this.client.decks;
		if (query) results = this.client.decks.filter(d => d.id.includes(search) || d.name.toLowerCase().includes(search));
		if (!results.size) return msg.util.send('Could not find any results.');
		return msg.util.send(stripIndents`
			__**Deck List:**__ _(${results.size} Results)_
			${results.map(deck => `${deck.name} (${deck.id})`).join('\n')}
		`);
	}
};
