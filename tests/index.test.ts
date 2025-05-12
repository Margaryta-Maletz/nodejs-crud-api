import dotenv from 'dotenv';
import http from 'http';
import request from 'supertest';
dotenv.config();

let server: http.Server;

beforeAll(() => {
  const listener = (_req: http.IncomingMessage, res: http.ServerResponse) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello World!' }));
  };
  server = http.createServer(listener).listen(process.env.PORT || 4000);
});

afterAll(() => {
  server.close();
});

test('GET / - should return hello message', async () => {
  const response = await request(server).get('/');
  expect(response.statusCode).toBe(200);
  expect(response.body).toMatchObject({ message: 'Hello World!' });
});
