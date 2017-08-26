const { send } = require('micro');
const redirect = require('micro-redirect');
const { ObjectId } = require('mongodb');

const database = require('../models/database');

const redirectRoute = async (req, res) => {
  const url = decodeURI(req.query.url);
  const _id = req.query._id;

  const db = await database();

  try {
    const result = await db
      .collection('videos')
      .updateOne(
        { _id: ObjectId(_id), 'videos.url': url },
        { $inc: { total_view_count: 1, 'videos.$.view_count': 1 } }
      );

    if (result.matchedCount > 0) {
      redirect(res, 302, encodeURI(url));
    }
  } catch (err) {
    console.error(err);
  }

  send(res, 404);
};

module.exports = redirectRoute;
