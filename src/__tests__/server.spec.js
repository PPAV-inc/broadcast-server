import request from 'supertest';
import server from '../server';

describe('server', () => {
  it('should be defined', () => {
    expect(server).toBeDefined();
  });

  it('should return 200 when GET /', async () => {
    const response = await request(server).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toEqual('I am good');
  });
});
