const { send } = require('micro');
const redirect = require('micro-redirect');
const { ObjectId } = require('mongodb');
const ua = require('universal-analytics');
const { parse } = require('tldjs');
const escapeRegExp = require('lodash/escapeRegExp');

const database = require('../models/database');
const aesDecrypt = require('./utils/aesDecrypt');

const visitor = ua(process.env.GA_TOKEN);

const redirectRoute = async (req, res) => {
  const { _id, user, url } = req.query;
  const _url = decodeURIComponent(url);
  const regexURL = `${escapeRegExp(_url)}|${escapeRegExp(encodeURI(_url))}`;

  const db = await database();

  try {
    const result = await db.collection('videos').updateOne(
      {
        _id: ObjectId(_id),
        'videos.url': { $regex: regexURL, $options: 'i' },
      },
      { $inc: { total_view_count: 1, 'videos.$.view_count': 1 } }
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

    if (result.matchedCount > 0) {
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
      }

      console.log(`redirect url: ${url}`);
      visitor.event('redirect statistics', parse(url).domain, url).send();
      redirect(res, 302, encodeURI(url));
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
