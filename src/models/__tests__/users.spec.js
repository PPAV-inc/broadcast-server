import { getSubscribeUsers, getAllUsers } from '../users';

jest.mock('../database');

const getDatabase = require('../database');

describe('getSubscribeUsers', () => {
  it('hould be defined', () => {
    expect(getSubscribeUsers).toBeDefined();
  });

  it('should return users', async () => {
    getDatabase.mockReturnValue({
      collection: jest.fn(() => ({
        find: jest.fn(() => ({
          toArray: jest.fn(() => [
            {
              userId: 1,
              firstName: 'first',
              lastName: 'last',
              username: 'username',
              acceptDisclaimer: true,
              autoDeleteMessages: false,
              languageCode: 'en',
            },
          ]),
        })),
      })),
    });
    const users = await getSubscribeUsers(12);

    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBe(1);
  });
});

describe('getAllUsers', () => {
  it('hould be defined', () => {
    expect(getAllUsers).toBeDefined();
  });

  it('should return all users', async () => {
    getDatabase.mockReturnValue({
      collection: jest.fn(() => ({
        find: jest.fn(() => ({
          toArray: jest.fn(() => [
            {
              userId: 1,
              firstName: 'first',
              lastName: 'last',
              username: 'username',
              acceptDisclaimer: true,
              autoDeleteMessages: false,
              languageCode: 'zh-TW',
            },
          ]),
        })),
      })),
    });
    const users = await getAllUsers('zh');

    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBe(1);
  });
});
