const { json, send } = require('micro');
const moment = require('moment-timezone');
const axios = require('axios');

const { getSubscribeUsers } = require('../models/users');

const broadcast = async (req, res) => {
  const body = await json(req);

  if (process.env.BROADCAST_SECRET === body.broadcastSecret) {
    const hour = moment.tz('Asia/Taipei').format('H');
    const subscribeUsers = await getSubscribeUsers(+hour);
    const botToken =
      process.env.NODE_ENV === 'development'
        ? process.env.DEV_BOT_TOKEN
        : process.env.PROD_BOT_TOKEN;
    try {
      /* eslint-disable */
      for (let i = 0; i < subscribeUsers.length; i += 1) {
        const { userId, firstName, subscribeHour } = subscribeUsers[i];

        await axios.post(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            chat_id: userId,
            text: `Hello ${firstName}, your subscribe hour is ${subscribeHour}.`,
          }
        );
      }
      /* eslint-enable */
    } catch (err) {
      console.log(err);
    }
  }

  send(res, 200, body);
};

module.exports = broadcast;
