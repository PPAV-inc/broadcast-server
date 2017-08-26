import getDatabase from '../database';

jest.mock('mongodb');

const { MongoClient } = require('mongodb');

describe('getDatabase', () => {
  it('should be defined', () => {
    expect(getDatabase).toBeDefined();
  });

  it('should call MongoClient.connect with process.env.PROD_MONGODB_PATH', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PROD_MONGODB_PATH = '__PROD_BOT_TOKEN__';
    await getDatabase();
    expect(MongoClient.connect).toBeCalledWith(process.env.PROD_MONGODB_PATH);
  });

  it('should call MongoClient.connect with process.env.DEV_MONGODB_PATH', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DEV_MONGODB_PATH = '__DEV_BOT_TOKEN__';
    await getDatabase();
    expect(MongoClient.connect).toBeCalledWith(process.env.DEV_MONGODB_PATH);
  });

  it('should return _db if called more than one time', async () => {
    MongoClient.connect.mockClear();
    MongoClient.connect.mockReturnValue({
      domain: null,
      s: {
        databaseName: 'PPAV',
        logger: { Logger: { className: 'Db' } },
      },
    });

    await getDatabase();
    await getDatabase();

    expect(MongoClient.connect).toHaveBeenCalledTimes(1);
  });
});
