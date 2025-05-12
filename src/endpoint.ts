import type { IncomingMessage, ServerResponse } from 'http';

import type { User } from './db';
import * as db from './db';

export const endpoint = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const { url, method } = req;

    if (url === '/api/users' || url?.startsWith('/api/users/')) {
      const segments = url.split('/').filter(Boolean);
      const id = segments[2];

      if (method === 'GET' && !id) {
        const users = await db.getAllUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(users));
      }

      if (method === 'POST') {
        const body = await collectRequestData(req);
        if (!validateUserData(body)) {
          res.writeHead(400);
          return res.end('Missing required fields');
        }
        const newUser = await db.createUser(body);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(newUser));
      }

      if (!db.isValidId(id)) {
        res.writeHead(400);
        return res.end('Invalid user ID');
      }

      if (method === 'GET' && id) {
        const user = await db.getUserById(id);
        if (!user) {
          res.writeHead(404);
          return res.end('User not found');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(user));
      }

      if (method === 'PUT' && id) {
        const body = await collectRequestData(req);
        const user = await db.updateUser(id, body);
        if (!user) {
          res.writeHead(404);
          return res.end('User not found');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(user));
      }

      if (method === 'DELETE' && id) {
        const success = await db.deleteUser(id);
        if (!success) {
          res.writeHead(404);
          return res.end('User not found');
        }
        res.writeHead(204);
        return res.end();
      }
    }

    res.writeHead(404);
    res.end('Resource not found');
  } catch (error) {
    res.writeHead(500);
    if (error instanceof Error) {
      res.end(`Internal server error: ${error.message}`);
    } else {
      res.end(`Internal server error`);
    }
  }
};

function collectRequestData(req: IncomingMessage): Promise<User> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function validateUserData(data: Omit<User, 'id'>) {
  try {
    return Boolean(
      data.username &&
        typeof data.age === 'number' &&
        Array.isArray(data.hobbies),
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }

    return false;
  }
}
