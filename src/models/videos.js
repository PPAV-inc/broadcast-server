const getDatabase = require('./database');

const getNewVideos = async () => {
  const db = await getDatabase();
  const newVideos = await db
    .collection('new_videos')
    .find()
    .sort({ total_view_count: -1 })
    .limit(3)
    .toArray();
  return newVideos;
};

module.exports.getNewVideos = getNewVideos;
