const { MongoClient } = require('mongodb');

let _db;
const getDatabase = async () => {
  if (_db) {
    return _db;
  }

  const mongodbPath =
    process.env.NODE_ENV === 'production'
      ? process.env.PROD_MONGODB_PATH
      : process.env.DEV_MONGODB_PATH;

  const db = await MongoClient.connect(mongodbPath);
  _db = db;
  return _db;
};

module.exports = getDatabase;
