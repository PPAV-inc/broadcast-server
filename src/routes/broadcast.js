const { json, send } = require('micro');
const moment = require('moment-timezone');
const pMap = require('p-map');
const differenceInMinutes = require('date-fns/differenceInMinutes');
const cloneDeep = require('lodash/cloneDeep');

const {
  getSubscribeUsers,
  getAllUsers,
  getUnacceptedUsers,
} = require('../models/users');
const { getNewVideos, getRecommendedVideos } = require('../models/videos');
const { newVideoKeyboard } = require('../utils/keyboards');
const locale = require('../utils/locale/index');
const aesEncrypt = require('./utils/aesEncrypt');
const client = require('./utils/client');

const URL = 'https://www.ppavgo.com';

const calculateBroadcastTime = (start) => {
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
    // broadcast to subscribed users
    const hour = moment.tz('Asia/Taipei').format('H');
    const subscribeUsers = await getSubscribeUsers(+hour);
    const newVideos = await getNewVideos();

    try {
      if (newVideos.length > 0) {
        console.log(
          `start broadcast to Subscribed Users. Totally ${subscribeUsers.length} users`
        );
        await pMap(
          subscribeUsers,
          async (user) => {
            const { userId, firstName, languageCode } = user;

            try {
              await client.sendMessage(
                userId,
                `${locale(languageCode).newVideos.greetingText(firstName)}`
              );

              let recVideos = [];
              try {
                recVideos = await getRecommendedVideos(userId);
              } catch (err) {
                console.error('error happens when get recVideos');
                console.error(err);
              }
              console.log(
                `broadcast to user: ${userId}, recVideos len: ${recVideos.length}`
              );

              const encryptUserId = aesEncrypt(`${userId}`);
              const sendVideos = recVideos
                .concat(cloneDeep(newVideos))
                .slice(0, 5)
                .map((eachResult) => {
                  const videos = eachResult.videos.map((video) => ({
                    ...video,
                    url: `${URL}/redirect/?url=${encodeURIComponent(
                      video.url
                    )}&_id=${eachResult._id}&user=${encodeURIComponent(
                      encryptUserId
                    )}`,
                  }));

                  return {
                    ...eachResult,
                    videos,
                  };
                });

              await pMap(
                sendVideos,
                async (video) => {
                  const options = newVideoKeyboard(languageCode, video);
                  await client.sendPhoto(userId, video.img_url, options);
                },
                { concurrency: 5 }
              );
            } catch (err) {
              console.error(`something wrong when send message to ${userId}`);
              console.error(err.message);
            }
          },
          { concurrency: 5 }
        );
      }

      console.log(`total broadcast to ${subscribeUsers.length} users`);
    } catch (err) {
      console.error(err);
    }
  } else if (body.broadcastSecret === process.env.BROADCAST_ALL_SECRET) {
    // broadcast to all users
    const allUsers = body.accept
      ? await getAllUsers(body.languageCode)
      : await getUnacceptedUsers();

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

          try {
            await client.sendMessage(userId, `${body.message}`);
          } catch (err) {
            console.error(`something wrong when send message to ${userId}`);
            console.error(err.message);
          }
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
