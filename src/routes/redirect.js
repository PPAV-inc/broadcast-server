const { send } = require('micro');
const redirect = require('micro-redirect');
const { ObjectId } = require('mongodb');
const ua = require('universal-analytics');
const { parse } = require('tldjs');
const escapeRegExp = require('lodash/escapeRegExp');
const get = require('lodash/get');

const { getDatabase } = require('../models/database');
const { getRelatedModels } = require('../models/videos');

const aesDecrypt = require('./utils/aesDecrypt');
const client = require('./utils/client');

const visitor = ua(process.env.GA_TOKEN);

const redirectRoute = async (req, res) => {
  const { _id, user, url } = req.query;
  const _url = decodeURIComponent(url);
  const regexURL = `${escapeRegExp(_url)}|${escapeRegExp(encodeURI(_url))}`;

  const db = await getDatabase();

  try {
    const result = await db.collection('videos').findOneAndUpdate(
      {
        _id: ObjectId(_id),
        'videos.url': { $regex: regexURL, $options: 'i' },
      },
      { $inc: { total_view_count: 1, 'videos.$.view_count': 1 } },
      { projection: { models: 1 } }
    );

    let userId = null;
    if (user) {
      const EncryptoUserId = decodeURIComponent(user);
      userId = aesDecrypt(EncryptoUserId);

      console.log(`redirect userId: ${userId}`);

      await db.collection('users').updateOne(
        {
          userId: parseInt(userId, 10),
        },
        { $set: { lastActivedAt: new Date() } }
      );
    } else {
      console.log(`not found user from url: ${req.url}`);
    }

    if (result.ok === 1) {
      console.log(`redirect url: ${url}`);
      visitor.event('redirect statistics', parse(url).domain, url).send();
      // redirect(res, 302, encodeURI(url));

      if (userId) {
        try {
          await db.collection('logs').insertOne({
            userId,
            videoId: ObjectId(_id),
            url,
            createdAt: new Date(),
          });
        } catch (err) {
          console.error(`error happens at encrypto user: ${user}`);
          console.error(err);
        }

        const models = get(result, 'value.models', []);
        const random = Math.random();

        // sometimes send recommended models
        // recommended related models
        if (models.length === 1 && random <= 0.4) {
          const relatedModels = await getRelatedModels(models[0]);

          const text = '我猜這幾個你會很愛的，多來幾槍吧！';
          const options = {
            parse_mode: 'Markdown',
            disable_web_page_preview: false,
            reply_markup: {
              inline_keyboard: relatedModels.slice(0, 5).map(model => [
                {
                  text: model,
                  callback_data: `keyword="${model}"&page="0"`,
                },
              ]),
            },
          };

          await client.sendMessage(userId, text, options);
        }
      }
    } else if (url.includes('ourshdtv')) {
      await db.collection('ourshdtv_logs').insertOne({
        createdAt: new Date(),
      });

      redirect(res, 302, encodeURI(url));
    } else {
      throw new Error(`result matchCount = 0, url: ${url}`);
    }
  } catch (err) {
    console.error('something wrong!');
    console.error(`url: ${url}`);
    console.error(`_id: ${_id}`);
    console.error(`user: ${user}`);
    console.error(err);
    send(res, 404);
  }
};

module.exports = redirectRoute;
