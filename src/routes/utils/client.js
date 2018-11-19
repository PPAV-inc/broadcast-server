const { TelegramClient } = require('messaging-api-telegram');

const botToken =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_BOT_TOKEN
    : process.env.DEV_BOT_TOKEN;

module.exports = TelegramClient.connect(botToken);
