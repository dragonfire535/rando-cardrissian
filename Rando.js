require('dotenv').config();
const { RANDO_TOKEN, RANDO_PREFIX, OWNERS, INVITE } = process.env;
const Client = require('./structures/Client');
const client = new Client({
	prefix: RANDO_PREFIX.split('||'),
	ownerID: OWNERS.split(','),
	disableEveryone: true,
	disabledEvents: ['TYPING_START']
});
const { stripIndents } = require('common-tags');

client.setup();

client.on('ready', () => {
	client.logger.info(`[READY] Logged in as ${client.user.tag}! ID: ${client.user.id}`);
	client.setInterval(() => client.user.setActivity('Cards Against Humanity'), 60000);
});

client.on('disconnect', event => {
	client.logger.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
	process.exit(0);
});

client.on('error', err => client.logger.error(err));

client.on('warn', warn => client.logger.warn(warn));

client.commandHandler.on('error', (err, msg, command) => {
	client.logger.error(`[COMMAND${command ? `:${command.name}` : ''}]\n${err.stack}`);
	msg.reply(stripIndents`
		An error occurred while running the command: \`${err.message}\`
		You shouldn't ever receive an error like this.
		${INVITE ? `Please visit ${INVITE} for help.` : 'Please pray for help.'}
	`).catch(() => null);
});

client.login(RANDO_TOKEN);

process.on('unhandledRejection', err => {
	client.logger.error(`[FATAL] UNHANDLED PROMISE REJECTION:\n${err.stack}`);
	process.exit(1);
});
