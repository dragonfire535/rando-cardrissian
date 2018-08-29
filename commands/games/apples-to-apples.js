const { Command, Argument } = require('discord-akairo');

module.exports = class ApplesToApplesCommand extends Command {
	constructor() {
		super('apples-to-apples', {
			aliases: ['apples-to-apples', 'a2a'],
			category: 'games',
			description: 'Compete to see who can come up with the best card to match an adjective.',
			channel: 'guild',
			clientPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			args: [
				{
					id: 'maxPts',
					prompt: {
						start: 'What amount of awesome points should determine the winner?',
						retry: 'You provided an invalid awesome points maximum. Please try again.'
					},
					type: Argument.range('integer', 1, 20, true)
				},
				{
					id: 'bot',
					match: 'flag',
					flag: ['--bot', '--rando', '-b', '-r']
				}
			]
		});
	}

	exec(msg, { maxPts, bot }) {
		return this.handler.modules.get('cards-against-humanity').exec(msg, { maxPts, bot, whitelist: 'apples' }, 'Green');
	}
};
