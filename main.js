const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const { bot_token } = config;

const bot = new Telegraf(bot_token);

const { processRegistration, continueRegistration, checkUserState } = require('./utils/registration');
const { processEventInfoMessage } = require('./utils/event_info');

// Set bot commands
bot.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'help', description: 'Bot use instructions' },
  { command: 'register', description: 'Register for the event' }
]).then(() => {
  console.log('Commands set successfully!');
}).catch(console.error);

// Handlers
bot.start(ctx => {
  ctx.reply('Hello! Below are the event details:');
  processEventInfoMessage(ctx);
});

bot.help(ctx => {
  ctx.reply('Usage instructions:\n/start - Greet and show event details\n/register - Register for the event\n/help - Show usage instructions');
});

bot.command('register', ctx => {
  processRegistration(ctx);
});

bot.on('text', ctx => {
  if (checkUserState(ctx.chat.id)) {
    continueRegistration(ctx);
  } else {
    ctx.reply('Unknown command. Type /help for instructions.');
  }
});

// Launch bot
bot.launch().then(() => {
  console.log('Bot started');
}).catch(console.error);
