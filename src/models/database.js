const { MongoClient } = require('mongodb');
const elasticsearch = require('elasticsearch');

let _db;
let _elasticsearchdb;

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

const getElasticsearchDatabase = () => {
  if (_elasticsearchdb) {
    return _elasticsearchdb;
  }

  const esUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.PROD_ES_URL
      : process.env.DEV_ES_URL;

  const db = new elasticsearch.Client({
    host: esUrl,
    log: 'error',
  });
  _elasticsearchdb = db;

  return _elasticsearchdb;
};

module.exports = {
  getDatabase,
  getElasticsearchDatabase,
};
