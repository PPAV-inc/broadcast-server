const { json, send } = require('micro');
const moment = require('moment-timezone');
const { TelegramClient } = require('messaging-api-telegram');
const pEachSeries = require('p-each-series');

const { getSubscribeUsers } = require('../models/users');
const { getNewVideos } = require('../models/videos');
const { newVideoKeyboard } = require('../utils/keyboards');
const locale = require('../utils/locale/index');

const botToken =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_BOT_TOKEN
    : process.env.PROD_BOT_TOKEN;

const client = TelegramClient.connect(botToken);

const broadcast = async (req, res) => {
  const body = await json(req);

  console.log(`get broadcast request at ${new Date()}`);
  if (process.env.BROADCAST_SECRET === body.broadcastSecret) {
    const hour = moment.tz('Asia/Taipei').format('H');
    const subscribeUsers = await getSubscribeUsers(+hour);
    const newVideos = await getNewVideos();

    try {
      if (newVideos.length > 0) {
        await pEachSeries(subscribeUsers, async user => {
          const { userId, firstName, languageCode } = user;

          await client.sendMessage(
            userId,
            `${locale(languageCode).newVideos.greetingText(firstName)}`
          );

          await pEachSeries(newVideos, async video => {
            const options = newVideoKeyboard(languageCode, video);
            await client.sendPhoto(userId, video.img_url, options);
          });
        });
      }

      console.log(`broadcast to ${subscribeUsers.length} users`);
    } catch (err) {
      console.error(err);
    }
  }

  send(res, 200, body);
};

module.exports = broadcast;
