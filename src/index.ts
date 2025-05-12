import dotenv from 'dotenv';
import http from 'http';

import { endpoint } from './endpoint';

dotenv.config();

const port = process.env.PORT || 4000;

const server = http.createServer(endpoint);

server.listen(port, () => {
  console.log(`Server started in ${process.env.NODE_ENV} mode on port ${port}`);
});
