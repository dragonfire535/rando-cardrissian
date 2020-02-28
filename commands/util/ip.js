const { Command } = require('discord-akairo');
const request = require('node-superfetch');

module.exports = class IpCommand extends Command {
	constructor() {
		super('ip', {
			aliases: ['ip'],
			category: 'util',
			description: 'Responds with the IP address the bot\'s server is running on.',
			ownerOnly: true
		});
	}

	async exec(msg) {
		const { body } = await request
			.get('https://api.ipify.org/')
			.query({ format: 'json' });
		return msg.util.send(body.ip);
	}
};
