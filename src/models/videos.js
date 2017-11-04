const subDays = require('date-fns/sub_days');
const getDatabase = require('./database');

const getNewVideos = async () => {
  const db = await getDatabase();
  const oneDaysBefore = subDays(new Date(), 1);

  const newVideos = await db
    .collection('videos')
    .find({
      updated_at: {
        $gte: oneDaysBefore,
      },
      $or: [
        { $where: 'this.videos.length !== 1' },
        { 'videos.source': { $ne: 'iavtv' } },
      ],
    })
    .sort({ publishedAt: -1, total_view_count: -1 })
    .limit(5)
    .toArray();

  return newVideos;
};

const getRecommendedVideos = async userId => {
  const db = await getDatabase();
  const user = await db.collection('rec_users').findOne({ userId });
  if (!user) return;

  const models = user.models
    .filter(model => model.count > 1) // FIXME: filter count number
    .map(each => each.model);

  if (models.length === 0) return;

  const oneDaysBefore = subDays(new Date(), 1);
  const recVideos = await db
    .collection('videos')
    .aggregate([
      {
        $match: {
          updated_at: {
            $gte: oneDaysBefore,
          },
          $or: [
            {
              'videos.1': { $exists: true },
            },
            { 'videos.source': { $ne: 'iavtv' } },
          ],
        },
      },
      {
        $addFields: {
          bothModels: { $setIntersection: ['$models', models] },
        },
      },
      {
        $match: {
          'bothModels.0': { $exists: true },
        },
      },
      { $sort: { total_view_count: -1 } },
      { $limit: 5 },
    ])
    .toArray();

  return recVideos;
};

module.exports = {
  getNewVideos,
  getRecommendedVideos,
};
