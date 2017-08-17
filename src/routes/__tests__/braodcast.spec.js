import broadcast from '../broadcast';

jest.mock('micro');

const { json, send } = require('micro');

describe('broadcast', () => {
  it('should be defined', () => {
    expect(broadcast).toBeDefined();
  });

  it('should call json and send', async () => {
    const reqBody = {
      hello: 'world',
    };
    json.mockImplementation(() => Promise.resolve(reqBody));
    await broadcast(reqBody, () => {});

    expect(json).toBeCalledWith(reqBody);
    expect(send.mock.calls[0][1]).toEqual(200);
    expect(send.mock.calls[0][2]).toEqual(reqBody);
  });
});
