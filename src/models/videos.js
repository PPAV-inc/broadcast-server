const { getDatabase, getElasticsearchDatabase } = require('./database');

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

const getRecommendedVideos = async userId => {
  const db = await getDatabase();
  const user = await db.collection('rec_users').findOne({ userId });
  if (!user) return [];

  const models = user.models
    .filter(model => model.count > 0) // FIXME: filter count number
    .map(each => each.model);

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

const getRelatedModels = async model => {
  const esClient = getElasticsearchDatabase();

  // http://coyee.com/article/11157-high-quality-recommendation-systems-with-elasticsearch-part-i
  const result = await esClient.search({
    index: 'users_history',
    type: 'users_history',
    body: {
      query: {
        // exactly match
        match_phrase: {
          models: model,
        },
      },
      aggs: {
        recommended_models: {
          significant_terms: {
            field: 'models.keyword',
            min_doc_count: 1,
          },
        },
      },
    },
  });

  const {
    aggregations: {
      recommended_models: { buckets },
    },
  } = result;

  return buckets.map(bucket => bucket.key).filter(name => name !== model);
};

module.exports = {
  getNewVideos,
  getRecommendedVideos,
  getRelatedModels,
};
