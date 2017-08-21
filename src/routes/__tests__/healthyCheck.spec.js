import healthyCheck from '../healthyCheck';

jest.mock('micro');

const { send } = require('micro');

describe('healthyCheck', () => {
  it('should be defined', () => {
    expect(healthyCheck).toBeDefined();
  });

  it('should call json and send', async () => {
    const reqBody = {
      hello: 'world',
    };
    await healthyCheck(reqBody, () => {});

    expect(send.mock.calls[0][1]).toEqual(200);
    expect(send.mock.calls[0][2]).toEqual('I am good');
  });
});
