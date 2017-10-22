const { json, send } = require('micro');
const moment = require('moment-timezone');
const { TelegramClient } = require('messaging-api-telegram');
const pEachSeries = require('p-each-series');
const pMap = require('p-map');
const differenceInMinutes = require('date-fns/difference_in_minutes');

const { getSubscribeUsers, getAllUsers } = require('../models/users');
const { getNewVideos } = require('../models/videos');
const { newVideoKeyboard } = require('../utils/keyboards');
const locale = require('../utils/locale/index');

const botToken =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_BOT_TOKEN
    : process.env.PROD_BOT_TOKEN;

const client = TelegramClient.connect(botToken);

const calculateBroadcastTime = start => {
  const done = new Date();
  console.log(`broadcast done at ${done}`);
  console.log(`take ${differenceInMinutes(done, start)} mins`);
};

const broadcast = async (req, res) => {
  const body = await json(req);
  send(res, 200, body);

  const start = new Date();
  console.log(`get broadcast request at ${start}`);

  if (body.broadcastSecret === process.env.BROADCAST_SUBSCRIBE_SECRET) {
    const hour = moment.tz('Asia/Taipei').format('H');
    const subscribeUsers = await getSubscribeUsers(+hour);
    const newVideos = await getNewVideos();

    try {
      if (newVideos.length > 0) {
        console.log(
          `start broadcast to Subscribed Users. Totally ${subscribeUsers.length} users`
        );
        await pEachSeries(subscribeUsers, async user => {
          const { userId, firstName, languageCode } = user;
          console.log(`broadcast to user: ${userId}`);

          try {
            await client.sendMessage(
              userId,
              `${locale(languageCode).newVideos.greetingText(firstName)}`
            );

            await pMap(
              newVideos,
              async video => {
                const options = newVideoKeyboard(languageCode, video);
                await client.sendPhoto(userId, video.img_url, options);
              },
              { concurrency: 5 }
            );
          } catch (err) {
            console.error(`something wrong when send message to ${userId}`);
            console.error(err.message);
          }
        });
      }

      console.log(`total broadcast to ${subscribeUsers.length} users`);
    } catch (err) {
      console.error(err);
    }
  } else if (body.broadcastSecret === process.env.BROADCAST_ALL_SECRET) {
    const allUsers = await getAllUsers(body.languageCode);
    try {
      const allUsersLength = allUsers.length;
      console.log(
        `start broadcast to All Users whose language code is "${body.languageCode}" related. Totally ${allUsersLength} users`
      );
      await pMap(
        allUsers,
        async (user, index) => {
          const { userId } = user;
          console.log(
            `broadcast to user: ${userId} (${index + 1}/${allUsersLength})`
          );

          await client.sendMessage(userId, `${body.message}`);
        },
        { concurrency: 5 }
      );
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error('broadcast secret is wrong');
  }
  calculateBroadcastTime(start);
};

module.exports = broadcast;
