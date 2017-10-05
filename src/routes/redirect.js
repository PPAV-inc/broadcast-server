const { send } = require('micro');
const redirect = require('micro-redirect');
const { ObjectId } = require('mongodb');
const ua = require('universal-analytics');
const { parse } = require('tldjs');
const escapeRegExp = require('lodash/escapeRegExp');

const database = require('../models/database');

const visitor = ua(process.env.GA_TOKEN);

const redirectRoute = async (req, res) => {
  const url = decodeURI(req.query.url);
  const _id = req.query._id;

  const db = await database();

  const regexURL = `${escapeRegExp(url)}|${escapeRegExp(encodeURI(url))}`;
  try {
    const result = await db.collection('videos').updateOne(
      {
        _id: ObjectId(_id),
        'videos.url': { $regex: regexURL, $options: 'i' },
      },
      { $inc: { total_view_count: 1, 'videos.$.view_count': 1 } }
    );

    if (result.matchedCount > 0) {
      console.log(`redirect url: ${url}`);
      visitor.event('redirect statistics', parse(url).domain, url).send();
      redirect(res, 302, encodeURI(url));
    } else {
      throw new Error(`result matchCount = 0, url: ${url}`);
    }
  } catch (err) {
    console.error(err);
  }

  send(res, 404);
};

module.exports = redirectRoute;
