import cluster from 'cluster';
import type { IncomingMessage, ServerResponse } from 'http';
import http from 'http';
import os from 'os';

export const balancer = (startServer: () => void, basePort: number) => {
  const numCPUs = Math.max(os.availableParallelism() - 1, 1);
  const workerPorts = Array.from(
    { length: numCPUs },
    (_, i) => basePort + i + 1,
  );
  let currentIndex = 0;
  const workerMap = new Map<number, number>();

  if (cluster.isPrimary) {
    console.log(
      `Primary process ${process.pid} is running in cluster mode on port ${basePort}`,
    );
    console.log(`Starting ${workerPorts.length} workers...\n`);

    workerPorts.forEach((workerPort, i) => {
      const worker = cluster.fork({ PORT: workerPort });
      if (worker.process.pid) {
        workerMap.set(worker.process.pid, workerPort);
      }
      console.log(`Worker #${i + 1} started on port ${workerPort}`);
    });

    const loadBalancer = http.createServer(
      (req: IncomingMessage, res: ServerResponse) => {
        const targetPort = workerPorts[currentIndex];

        currentIndex = (currentIndex + 1) % workerPorts.length;

        const options = {
          hostname: 'localhost',
          port: targetPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        };

        const proxyReq = http.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode!, proxyRes.headers);

          console.log(
            `Request ${options.method} is sending on port ${options.port}`,
          );

          proxyRes.pipe(res, { end: true });
        });

        req.pipe(proxyReq, { end: true });

        proxyReq.on('error', (error) => {
          console.error(`Ошибка проксирования на порт ${targetPort}:`, error);
          res.writeHead(502);
          res.end('Error forwarding request');
        });
      },
    );

    loadBalancer.listen(basePort, () => {
      console.log(`Load Balancer listening on port ${basePort}`);
      console.log(`Forwarding requests to: ${workerPorts.join(', ')}`);
    });

    cluster.on('exit', (worker, code, signal) => {
      const workerPort = worker.process.pid
        ? workerMap.get(worker.process.pid)
        : basePort;
      if (workerPort) {
        console.log(
          `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting port: ${workerPort}...`,
        );
        const newWorker = cluster.fork({ PORT: workerPort });
        if (newWorker.process.pid) {
          workerMap.set(newWorker.process.pid, workerPort);
        }
        console.log(`Worker restarted: ${newWorker.process.pid}`);
      }
    });

    cluster.on('error', (worker) => {
      console.error(`Error occurred ${worker.process.pid}`);
    });
  } else {
    startServer();
  }
};
