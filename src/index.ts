import dotenv from 'dotenv';
import http from 'http';

import { balancer } from './balancer';
import { endpoint } from './endpoint';

dotenv.config();

const port = process.env.PORT || 4000;
const mode = process.env.NODE_ENV || 'development';
const isClusterMode = process.argv.includes('--multi');

const startServer = () => {
  const server = http.createServer(endpoint);

  server.listen(port, () => {
    console.log(`Server started in ${mode} mode on port ${port}`);
  });
};

if (isClusterMode) {
  balancer(startServer, Number(port));
} else {
  startServer();
}
