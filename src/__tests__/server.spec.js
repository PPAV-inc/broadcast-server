import request from 'supertest';
import server from '../server';

describe('server', () => {
  it('should be defined', () => {
    expect(server).toBeDefined();
  });

  it('should return 200 when POST /broadcast', async () => {
    const reqbody = {
      hello: 'world',
    };
    const response = await request(server).post('/broadcast').send(reqbody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(reqbody);
  });
});
