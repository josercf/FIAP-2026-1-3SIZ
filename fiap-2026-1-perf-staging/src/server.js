// src/server.js
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncDb } from './db/index.js';
import { healthRouter } from './routes/health.js';
import { usersRouter } from './routes/users.js';
import { ordersRouter } from './routes/orders.js';
import { productsRouter } from './routes/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../database.sqlite');

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/health', healthRouter);
  app.use('/users', usersRouter);
  app.use('/orders', ordersRouter);
  app.use('/products', productsRouter);
  return app;
}

async function main() {
  if (!fs.existsSync(dbPath)) {
    console.log('[bootstrap] database.sqlite não existe; rodando seed inicial...');
    await import('./db/seed.js');
  } else {
    await syncDb();
  }

  const app = createApp();
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`[fiap-2026-1-perf] listening on http://localhost:${PORT}`);
  });
}

// Só roda se for o entry point (não em testes)
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main();
}
