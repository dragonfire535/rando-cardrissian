const { Command } = require('discord-akairo');
const request = require('node-superfetch');
const { IMGUR_KEY, LANDO_ALBUM_ID } = process.env;

module.exports = class LandoCommand extends Command {
	constructor() {
		super('lando', {
			aliases: ['lando', 'lando-calrissian', 'rando-cardrissian', 'rando'],
			category: 'other',
			description: 'Responds with a random image of Lando Calrissian.',
			clientPermissions: ['ATTACH_FILES']
		});

		this.cache = null;
	}

	async exec(msg) {
		try {
			const image = await this.random();
			if (!image) return msg.util.reply('This album has no images...');
			return msg.util.send('', { files: [image] });
		} catch (err) {
			return msg.util.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	async random() {
		if (this.cache) return this.cache[Math.floor(Math.random() * this.cache.length)];
		const { body } = await request
			.get(`https://api.imgur.com/3/album/${LANDO_ALBUM_ID}`)
			.set({ Authorization: `Client-ID ${IMGUR_KEY}` });
		if (!body.data.images.length) return null;
		this.cache = body.data.images.map(image => image.link);
		setTimeout(() => { this.cache = null; }, 3.6e+6);
		return body.data.images[Math.floor(Math.random() * body.data.images.length)].link;
	}
};
