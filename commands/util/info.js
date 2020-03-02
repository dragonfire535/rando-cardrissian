const { Command, version: akairoVersion } = require('discord-akairo');
const { MessageEmbed, version: djsVersion, Permissions } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
const { version, dependencies } = require('../../package');
const { INVITE, RANDO_GITHUB_REPO_USERNAME, RANDO_GITHUB_REPO_NAME } = process.env;
const source = RANDO_GITHUB_REPO_NAME && RANDO_GITHUB_REPO_USERNAME;

module.exports = class InfoCommand extends Command {
	constructor() {
		super('info', {
			aliases: ['info', 'information', 'stats'],
			category: 'util',
			description: 'Responds with detailed bot information.',
			clientPermissions: ['EMBED_LINKS']
		});
	}

	async exec(msg) {
		const invite = await this.client.generateInvite(Permissions.ALL);
		const embed = new MessageEmbed()
			.setColor(0x00AE86)
			.setFooter('©2018-2020 dragonfire535#8081')
			.addField('❯ Servers', this.client.guilds.cache.size, true)
			.addField('❯ Commands', this.handler.modules.size, true)
			.addField('❯ Shards', this.client.options.shardCount, true)
			.addField('❯ Home Server', INVITE ? `[Invite](${INVITE})` : 'None', true)
			.addField('❯ Invite', `[Add Me](${invite})`, true)
			.addField('❯ Source Code',
				source ? `[Github](https://github.com/${RANDO_GITHUB_REPO_USERNAME}/${RANDO_GITHUB_REPO_NAME})` : 'N/A', true)
			.addField('❯ Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
			.addField('❯ Uptime', moment.duration(this.client.uptime).format('d:hh:mm:ss'), true)
			.addField('❯ Version', `v${version}`, true)
			.addField('❯ Node.js', process.version, true)
			.addField('❯ Discord.js', `v${djsVersion}`, true)
			.addField('❯ Akairo', `v${akairoVersion}`, true)
			.addField('❯ Dependencies', this.parseDependencies(dependencies));
		return msg.util.send({ embed });
	}

	parseDependencies(deps) {
		return Object.entries(deps).map(dep => {
			if (dep[1].startsWith('github:')) {
				const repo = dep[1].replace('github:', '').split('/');
				return `[${dep[0]}](https://github.com/${repo[0]}/${repo[1].replace(/#(.+)/, '/tree/$1')})`;
			}
			return `[${dep[0]}](https://npmjs.com/${dep[0]})`;
		}).join(', ');
	}
};
