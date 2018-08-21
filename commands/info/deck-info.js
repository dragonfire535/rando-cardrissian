const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { RANDO_GITHUB_REPO_USERNAME, RANDO_GITHUB_REPO_NAME } = process.env;

module.exports = class DeckInfoCommand extends Command {
	constructor() {
		super('deck-info', {
			aliases: ['deck-info', 'deck'],
			category: 'other',
			description: 'Responds with detailed information on a deck.',
			args: [
				{
					id: 'deck',
					prompt: {
						start: 'What deck would you like to get information on?',
						retry: 'You provided an invalid deck. Please try again.'
					},
					type: deck => {
						if (!deck) return null;
						const search = deck.toLowerCase();
						const found = this.client.decks.filter(d => d.id.includes(search) || d.name.toLowerCase().includes(search));
						if (!found.size || found.size > 1) return null;
						return found.first();
					}
				}
			]
		});
	}

	exec(msg, { deck }) {
		// eslint-disable-next-line max-len
		const url = `https://github.com/${RANDO_GITHUB_REPO_USERNAME}/${RANDO_GITHUB_REPO_NAME}/blob/master/assets/json/decks/${deck.id}.json`;
		const embed = new MessageEmbed()
			.setColor(0x00AE86)
			.setURL(url)
			.addField('❯ Name', deck.name)
			.addField('❯ ID', deck.id, true)
			.addField('❯ Official?', deck.official ? 'Yes' : 'No', true)
			.addField('❯ View', `[Here](${url})`, true)
			.addField('❯ Black Cards', deck.blackCards.length, true)
			.addField('❯ White Cards', deck.whiteCards.length, true);
		return msg.util.send({ embed });
	}
};
