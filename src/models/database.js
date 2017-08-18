const { MongoClient } = require('mongodb');

let _db;
const getDatabase = async () => {
  if (_db) {
    return _db;
  }

  const mongodbPath =
    process.env.NODE_ENV === 'development'
      ? process.env.DEV_MONGODB_PATH
      : process.env.PROD_MONGODB_PATH;

  const db = await MongoClient.connect(mongodbPath);
  _db = db;
  return _db;
};

module.exports = getDatabase;
