import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const port = process.env.PORT || 4000;

const requestListener = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({ message: 'Hello World!', mode: process.env.NODE_ENV }),
  );
};

const server = http.createServer(requestListener);

server.listen(port, () => {
  console.log(`Server started in ${process.env.NODE_ENV} mode on port ${port}`);
});
