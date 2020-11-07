const getDatabase = require('./database');

const getNewVideos = async () => {
  const db = await getDatabase();

  const newVideos = await db
    .collection('rec_videos')
    .find()
    .sort({ publishedAt: -1, total_view_count: -1 })
    .limit(5)
    .toArray();

  return newVideos;
};

const getRecommendedVideos = async (userId) => {
  const db = await getDatabase();
  const user = await db.collection('rec_users').findOne({ userId });
  if (!user) return [];

  const models = user.models
    .filter((model) => model.count > 0) // FIXME: filter count number
    .map((each) => each.model);

  console.log(`models length: ${models.length}`);
  if (models.length === 0) return [];

  const recVideos = await db
    .collection('rec_videos')
    .aggregate([
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
      { $sort: { publishedAt: -1, total_view_count: -1 } },
      { $limit: 5 },
    ])
    .toArray();

  return recVideos;
};

module.exports = {
  getNewVideos,
  getRecommendedVideos,
};
