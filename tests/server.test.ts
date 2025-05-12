import request from 'supertest';
import http from 'http';
import { endpoint } from '../src/endpoint';

const startServer = () => {
  const server = http.createServer(endpoint);
  const port = 5000;

  server.listen(port, () => {
    console.log(`Test server started on port ${port}`);
  });

  return server;
};

const mockUser = {
  username: 'Rita',
  age: 20,
  hobbies: []
};

let existId: string;

describe('API Tests: GET nonexistent', () => {
  let server: http.Server;

  beforeAll(() => {
    server = startServer();
  });

  afterAll(() => {
    server.close();
  });

  test('Should return 404', async () => {
    const response = await request(server).get('/api/nonexistent');
    expect(response.status).toBe(404);
  });
});

describe('API Tests: GET and POST requests', () => {
  let server: http.Server;

  beforeAll(() => {
    server = startServer();
  });

  afterAll(() => {
    server.close();
  });

  test('Should return an empty array', async () => {
    const response = await request(server).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([]);
  });

  test('Should create a new object', async () => {
    const response = await request(server).post('/api/users').send(mockUser);
    expect(response.status).toBe(201);
    const {id, ...user} = response.body;
    existId = id;
    expect(user).toStrictEqual(mockUser);
  });

  test('Should return a response with existing objects', async () => {
    const response = await request(server).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([{id: existId, ...mockUser}]);
  });
});

describe('API Tests: GET by ID', () => {
  let server: http.Server;

  beforeAll(() => {
    server = startServer();
  });

  afterAll(() => {
    server.close();
  });

  test('Should return a response with the existing object', async () => {
    const response = await request(server).post('/api/users').send(mockUser);
    existId = response.body.id;

    const getResponse = await request(server).get(`/api/users/${existId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toStrictEqual({id: existId, ...mockUser});
  });

  test('Should return a code 400 if userId is invalid', async () => {
    const response = await request(server).get(`/api/users/400`);
    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid user ID');
  });

  test('Should update the object ', async () => {
    const newAge = 50;
    const response = await request(server).put(`/api/users/${existId}`).send({...mockUser, age: newAge});
    expect(response.status).toBe(200);
    const {id, age} = response.body;
    expect(id).toBe(existId);
    expect(age).not.toBe(mockUser.age);
    expect(age).toBe(newAge);
  });

  test('Should delete the object ', async () => {
    const response = await request(server).delete(`/api/users/${existId}`);
    expect(response.status).toBe(204);
  });

  test('Should return 404 if userId does not exist', async () => {
    const response = await request(server).get(`/api/users/${existId}`);
    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });
});