const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');

module.exports = class DonateCommand extends Command {
	constructor() {
		super('donate', {
			aliases: ['donate', 'paypal'],
			category: 'util',
			description: 'Responds with the bot\'s donation links.'
		});
	}

	exec(msg) {
		return msg.util.send(stripIndents`
			Contribute to development!
			<https://paypal.me/dragonfire535>
		`);
	}
};
