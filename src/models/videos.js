const subDays = require('date-fns/sub_days');
const getTime = require('date-fns/get_time');
const getDatabase = require('./database');

const getNewVideos = async () => {
  const db = await getDatabase();
  const now = Date.now();

  const newVideos = await db
    .collection('videos')
    .find({
      updated_at: {
        $gte: new Date(getTime(subDays(now, 1))),
        $lte: new Date(now),
      },
      $or: [
        { $where: 'this.videos.length !== 1' },
        { 'videos.source': { $ne: 'iavtv' } },
      ],
    })
    .sort({ publishedAt: -1, total_view_count: -1 })
    .limit(3)
    .toArray();
  return newVideos;
};

module.exports.getNewVideos = getNewVideos;
