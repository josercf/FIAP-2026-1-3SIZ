# Aula 11 — Testes de Carga: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a aula 11 (`aulas-2sem/aulas/aula11.html`) com fundamentos profundos sobre métricas, conceitos novos (ramp-up/down, hot path), 4 quizzes funcionais, e laboratório guiado — apoiado por novo repositório `fiap-2026-1-perf` com API Node deliberadamente lenta + scripts k6 prontos.

**Architecture:** Dois entregáveis acoplados: (1) novo repo Node (Express + Sequelize + SQLite, ESM, Node 20+) com 3 endpoints contendo gargalos plantados (sync I/O, N+1, sem cache) e 4 scripts k6; (2) reescrita do HTML da aula com 28 slides Reveal.js, SVGs inline para diagramas, screenshots reais para output do k6, e quizzes no padrão canônico do `fiap-quiz.js`.

**Tech Stack:**
- **Repo prático:** Node 20+, Express ^4, Sequelize ^6, sqlite3, @faker-js/faker, k6 (binário externo). Testes via `node --test` (built-in) + supertest.
- **Slides:** Reveal.js 5.1, HTML/CSS estático, SVG inline, padrão FIAP existente (`fiap-theme.css`, `fiap-quiz.js`, `fiap-print.js`).

**Spec de origem:** `docs/superpowers/specs/2026-05-05-aula11-testes-de-carga-design.md`

---

## File Structure

### Stream A — Repo `fiap-2026-1-perf` (novo)

Localização: `/Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf` (sibling de `FIAP-2026-1-3SIZ`).

| Arquivo | Responsabilidade |
|---|---|
| `package.json` | Dependências, scripts (`start`, `seed`, `test`), ESM |
| `.gitignore` | `node_modules`, `database.sqlite`, `*.log` |
| `src/server.js` | Express bootstrap, montagem de rotas, listen |
| `src/db/index.js` | Sequelize bootstrap, sync, export de models |
| `src/db/models/user.js` | Model `User` (id, name, email, createdAt) |
| `src/db/models/order.js` | Model `Order` (id, userId, total, status, createdAt) |
| `src/db/models/orderItem.js` | Model `OrderItem` (id, orderId, productId, qty, unitPrice) |
| `src/db/models/product.js` | Model `Product` (id, name, description, price, popularity, stock) |
| `src/db/seed.js` | Geração de 1000 users + 200 products + 5000 orders + 15000 items via faker |
| `src/routes/health.js` | `GET /health` — retorna `{ status: 'ok' }` |
| `src/routes/users.js` | `GET /users/:id/profile` — **gargalo plantado #1** (sync I/O via `pbkdf2Sync`) |
| `src/routes/orders.js` | `GET /orders` — **gargalo plantado #2** (N+1 query) |
| `src/routes/products.js` | `GET /products` — **gargalo plantado #3** (sem cache, hot path) |
| `tests/health.test.js` | Sanity test do `/health` |
| `tests/users.test.js` | Sanity test do `/users/:id/profile` (status + shape) |
| `tests/orders.test.js` | Sanity test do `/orders` (status + shape) |
| `tests/products.test.js` | Sanity test do `/products` (status + shape) |
| `k6/baseline.js` | Teste base, 0→20 VUs, mira `/health` |
| `k6/sync-io.js` | Teste focado, 0→50 VUs, mira `/users/:id/profile` |
| `k6/n-plus-one.js` | Teste focado, 0→30 VUs, mira `/orders` |
| `k6/products-cache.js` | Teste do desafio, 0→100 VUs, mira `/products` |
| `docs/iteracao-1-sync-io.md` | Gabarito: sintoma, fix, número de melhoria |
| `docs/iteracao-2-n-plus-one.md` | Gabarito: sintoma, fix, número de melhoria |
| `docs/desafio-cache.md` | Roteiro do desafio + gabarito |
| `README.md` | Setup + roteiro pedagógico + endpoints + scripts k6 |

### Stream B — Slides `aula11.html` (reescrita)

Localização: `/Users/joseromualdocostafilho/Projects/FIAP/FIAP-2026-1-3SIZ/aulas-2sem/aulas/aula11.html`

Mantém: `<head>` (CDNs, fontes, CSS FIAP), `<script>` Reveal init no final.
Reescreve: todo o conteúdo de `<div class="slides">`.

Imagens novas (PNG/JPG) em `aulas-2sem/assets/img/`:
- `k6-install-windows.png`, `k6-install-macos.png`, `k6-install-linux.png`, `k6-version.png`
- `k6-output-anatomy.png` (slide 12)
- `aula11-iteracao1-baseline.png`, `aula11-iteracao1-fix.png`
- `aula11-iteracao2-baseline.png`, `aula11-iteracao2-fix.png`

(Imagens são capturadas em ambiente real pelo professor/agente após a API estar pronta — ver Tarefa 25.)

---

## Convenções de execução

- **Diretório de trabalho do repo prático:** `/Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf` (criado na Tarefa 1).
- **Diretório de trabalho dos slides:** `/Users/joseromualdocostafilho/Projects/FIAP/FIAP-2026-1-3SIZ`.
- **Commits:** repo prático tem seu próprio histórico git; slides são commitados no repo `FIAP-2026-1-3SIZ`. Cada tarefa termina com commit próprio em seu repo.
- **Cores FIAP** (referência para SVGs): primária `#ED145B` (rosa), secundária `#1E1E2C` (escuro), accent `#00A859` (verde).
- **Testes do repo Node:** `node --test tests/` — sem framework adicional.
- **Validação dos slides:** abrir `aula11.html` no Chrome (servir via `python3 -m http.server 8080` em `aulas-2sem/`), navegar slide a slide, clicar todos os quizzes, exportar PDF (`?print-pdf` na URL).

---

# STREAM A — Repositório `fiap-2026-1-perf`

## Task 1: Scaffold do repositório

**Files:**
- Create: `/Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf/package.json`
- Create: `/Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf/.gitignore`
- Create: `/Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf/src/server.js` (placeholder mínimo)

- [ ] **Step 1: Criar diretório e inicializar git**

```bash
mkdir -p /Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf
cd /Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf
git init
mkdir -p src/routes src/db/models tests k6 docs
```

- [ ] **Step 2: Criar `package.json`**

```json
{
  "name": "fiap-2026-1-perf",
  "version": "1.0.0",
  "description": "Laboratório de testes de carga - FIAP 3SIZ Aula 11",
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "start": "node src/server.js",
    "seed": "node src/db/seed.js",
    "test": "node --test tests/",
    "reset": "rm -f database.sqlite && npm run seed"
  },
  "dependencies": {
    "express": "^4.21.0",
    "sequelize": "^6.37.0",
    "sqlite3": "^5.1.7",
    "@faker-js/faker": "^9.0.0"
  },
  "devDependencies": {
    "supertest": "^7.0.0"
  },
  "license": "UNLICENSED",
  "private": true
}
```

- [ ] **Step 3: Criar `.gitignore`**

```
node_modules/
database.sqlite
*.log
.DS_Store
.env
coverage/
```

- [ ] **Step 4: Criar `src/server.js` placeholder mínimo**

```js
// src/server.js
import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[fiap-2026-1-perf] listening on http://localhost:${PORT}`);
});
```

- [ ] **Step 5: Instalar dependências**

```bash
cd /Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf
npm install
```

Expected: `node_modules/` populated, `package-lock.json` criado, sem erros.

- [ ] **Step 6: Validar bootstrap manual**

```bash
node src/server.js &
sleep 1
curl -s http://localhost:3000/health
kill %1
```

Expected: `{"status":"ok"}` impresso.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: scaffold do repo fiap-2026-1-perf (Node + Express)"
```

---

## Task 2: Setup do Sequelize e modelos

**Files:**
- Create: `src/db/index.js`
- Create: `src/db/models/user.js`
- Create: `src/db/models/order.js`
- Create: `src/db/models/orderItem.js`
- Create: `src/db/models/product.js`

- [ ] **Step 1: Criar `src/db/index.js`**

```js
// src/db/index.js
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // troque para console.log para ver queries (útil na iteração 2)
});

import { defineUser } from './models/user.js';
import { defineOrder } from './models/order.js';
import { defineOrderItem } from './models/orderItem.js';
import { defineProduct } from './models/product.js';

export const User = defineUser(sequelize);
export const Order = defineOrder(sequelize);
export const OrderItem = defineOrderItem(sequelize);
export const Product = defineProduct(sequelize);

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export async function syncDb({ force = false } = {}) {
  await sequelize.sync({ force });
}
```

- [ ] **Step 2: Criar `src/db/models/user.js`**

```js
// src/db/models/user.js
import { DataTypes } from 'sequelize';

export function defineUser(sequelize) {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, { tableName: 'users', timestamps: true });
}
```

- [ ] **Step 3: Criar `src/db/models/order.js`**

```js
// src/db/models/order.js
import { DataTypes } from 'sequelize';

export function defineOrder(sequelize) {
  return sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  }, { tableName: 'orders', timestamps: true });
}
```

- [ ] **Step 4: Criar `src/db/models/orderItem.js`**

```js
// src/db/models/orderItem.js
import { DataTypes } from 'sequelize';

export function defineOrderItem(sequelize) {
  return sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  }, { tableName: 'order_items', timestamps: false });
}
```

- [ ] **Step 5: Criar `src/db/models/product.js`**

```js
// src/db/models/product.js
import { DataTypes } from 'sequelize';

export function defineProduct(sequelize) {
  return sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    popularity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, { tableName: 'products', timestamps: true });
}
```

- [ ] **Step 6: Verificar sync das tabelas**

Adicionar temporariamente em `src/server.js` (no topo):

```js
import { syncDb } from './db/index.js';
await syncDb();
```

Rodar:
```bash
node src/server.js &
sleep 2
sqlite3 database.sqlite ".tables"
kill %1
```

Expected: `order_items  orders  products  users` listado.

Remover o `import { syncDb }` e `await syncDb()` de `src/server.js` (vai ser feito pelo seed na próxima tarefa). Ou **deixar** se preferir que o servidor sempre garanta tabelas — neste plano vamos *deixar* para garantir UX zero-atrito.

- [ ] **Step 7: Commit**

```bash
git add src/db/
git commit -m "feat: modelos Sequelize (User, Order, OrderItem, Product) com associações"
```

---

## Task 3: Seed de dados

**Files:**
- Create: `src/db/seed.js`

- [ ] **Step 1: Criar `src/db/seed.js`**

```js
// src/db/seed.js
import { faker } from '@faker-js/faker';
import { sequelize, syncDb, User, Product, Order, OrderItem } from './index.js';

const N_USERS = 1000;
const N_PRODUCTS = 200;
const ORDERS_PER_USER = 5;
const ITEMS_PER_ORDER = 3;

async function run() {
  console.log('[seed] sync (force=true)...');
  await syncDb({ force: true });

  console.log(`[seed] ${N_USERS} users...`);
  const users = await User.bulkCreate(
    Array.from({ length: N_USERS }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
    }))
  );

  console.log(`[seed] ${N_PRODUCTS} products...`);
  const products = await Product.bulkCreate(
    Array.from({ length: N_PRODUCTS }, () => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      popularity: faker.number.int({ min: 0, max: 1000 }),
      stock: faker.number.int({ min: 0, max: 500 }),
    }))
  );

  console.log(`[seed] ${N_USERS * ORDERS_PER_USER} orders + items...`);
  for (const user of users) {
    const orders = await Order.bulkCreate(
      Array.from({ length: ORDERS_PER_USER }, () => ({
        userId: user.id,
        total: parseFloat(faker.commerce.price({ min: 50, max: 5000 })),
        status: faker.helpers.arrayElement(['pending', 'paid', 'shipped', 'delivered']),
      }))
    );

    const itemsBatch = [];
    for (const order of orders) {
      for (let i = 0; i < ITEMS_PER_ORDER; i++) {
        const product = faker.helpers.arrayElement(products);
        itemsBatch.push({
          orderId: order.id,
          productId: product.id,
          qty: faker.number.int({ min: 1, max: 5 }),
          unitPrice: product.price,
        });
      }
    }
    await OrderItem.bulkCreate(itemsBatch);
  }

  console.log('[seed] done.');
  await sequelize.close();
}

run().catch((err) => {
  console.error('[seed] fatal:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Rodar o seed**

```bash
cd /Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf
npm run seed
```

Expected: log de progresso, finaliza em ~30-60s. `database.sqlite` criado com tamanho >1MB.

- [ ] **Step 3: Validar contagem de registros**

```bash
sqlite3 database.sqlite "SELECT 'users' as t, COUNT(*) FROM users UNION SELECT 'products', COUNT(*) FROM products UNION SELECT 'orders', COUNT(*) FROM orders UNION SELECT 'items', COUNT(*) FROM order_items;"
```

Expected:
```
items|15000
orders|5000
products|200
users|1000
```

- [ ] **Step 4: Adicionar auto-seed em `src/server.js` se DB não existir**

Editar `src/server.js`:

```js
// src/server.js
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncDb } from './db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../database.sqlite');

if (!fs.existsSync(dbPath)) {
  console.log('[bootstrap] database.sqlite não existe; rodando seed inicial...');
  await import('./db/seed.js');
} else {
  await syncDb();
}

const app = express();
const PORT = process.env.PORT ?? 3000;

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[fiap-2026-1-perf] listening on http://localhost:${PORT}`);
});
```

- [ ] **Step 5: Validar npm start em DB vazio**

```bash
rm database.sqlite
npm start &
sleep 60   # seed roda no startup
curl -s http://localhost:3000/health
kill %1
```

Expected: log do seed, depois servidor sobe, `/health` responde `{"status":"ok"}`.

- [ ] **Step 6: Commit**

```bash
git add src/db/seed.js src/server.js
git commit -m "feat: seed automático de 1000 users + 200 products + 5000 orders + 15000 items"
```

---

## Task 4: Rota `/health` com teste

**Files:**
- Create: `src/routes/health.js`
- Create: `tests/health.test.js`
- Modify: `src/server.js` (extrair rota para módulo)

- [ ] **Step 1: Escrever teste falhando primeiro**

Criar `tests/health.test.js`:

```js
// tests/health.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/server.js';

test('GET /health responde 200 com status ok', async () => {
  const app = createApp();
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
});
```

- [ ] **Step 2: Rodar teste — deve falhar**

```bash
npm test
```

Expected: FAIL — `createApp` não existe ou import quebrado.

- [ ] **Step 3: Criar `src/routes/health.js`**

```js
// src/routes/health.js
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => res.json({ status: 'ok' }));
```

- [ ] **Step 4: Refatorar `src/server.js` para exportar `createApp`**

```js
// src/server.js
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncDb } from './db/index.js';
import { healthRouter } from './routes/health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../database.sqlite');

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/health', healthRouter);
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
```

- [ ] **Step 5: Rodar teste — deve passar**

```bash
npm test
```

Expected: `# pass 1`.

- [ ] **Step 6: Commit**

```bash
git add src/routes/health.js src/server.js tests/health.test.js
git commit -m "feat: rota /health + teste sanity + createApp factory"
```

---

## Task 5: Rota `/users/:id/profile` com gargalo de sync I/O

**Files:**
- Create: `src/routes/users.js`
- Create: `tests/users.test.js`
- Modify: `src/server.js`

- [ ] **Step 1: Escrever teste falhando primeiro**

Criar `tests/users.test.js`:

```js
// tests/users.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/server.js';
import { syncDb, User } from '../src/db/index.js';

test('GET /users/:id/profile retorna user + integrity', async () => {
  await syncDb();
  const u = await User.create({ name: 'Test User', email: `t${Date.now()}@x.com` });

  const app = createApp();
  const res = await request(app).get(`/users/${u.id}/profile`);

  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Test User');
  assert.ok(typeof res.body.integrity === 'string');
  assert.ok(res.body.integrity.length >= 32);
});

test('GET /users/:id/profile retorna 404 quando user não existe', async () => {
  const app = createApp();
  const res = await request(app).get('/users/999999/profile');
  assert.equal(res.status, 404);
});
```

- [ ] **Step 2: Rodar teste — deve falhar**

```bash
npm test
```

Expected: FAIL — rota inexistente.

- [ ] **Step 3: Criar `src/routes/users.js` com gargalo plantado**

```js
// src/routes/users.js
import { Router } from 'express';
import crypto from 'node:crypto';
import { User } from '../db/index.js';

export const usersRouter = Router();

/**
 * GARGALO PLANTADO #1 — sync I/O bloqueando event loop.
 *
 * `crypto.pbkdf2Sync` com 100_000 iterações leva ~80–150ms no hardware
 * típico de 2025. Em Node single-thread, isso BLOQUEIA o event loop —
 * todas as outras requisições enfileiram até essa terminar.
 *
 * Fix esperado: usar a versão async (`crypto.pbkdf2`) com `promisify`,
 * ou mover para um `Worker`. Ver docs/iteracao-1-sync-io.md.
 */
usersRouter.get('/:id/profile', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'not found' });

  const payload = JSON.stringify({ id: user.id, email: user.email });
  const integrity = crypto
    .pbkdf2Sync(payload, 'fiap-salt', 100_000, 32, 'sha512')
    .toString('hex');

  res.json({ ...user.toJSON(), integrity });
});
```

- [ ] **Step 4: Registrar rota em `src/server.js`**

Editar `createApp()`:

```js
import { usersRouter } from './routes/users.js';
// ...
export function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/health', healthRouter);
  app.use('/users', usersRouter);
  return app;
}
```

- [ ] **Step 5: Rodar teste — deve passar**

```bash
npm test
```

Expected: `# pass 3`.

- [ ] **Step 6: Validar latência manualmente (proves o gargalo)**

```bash
npm start &
sleep 5
time curl -s http://localhost:3000/users/1/profile > /dev/null
time curl -s http://localhost:3000/users/2/profile > /dev/null
kill %1
```

Expected: cada `curl` leva >50ms (tempo do `pbkdf2Sync`). Se passar de 300ms ou ficar abaixo de 30ms, ajustar `100_000` para mais/menos iterações em hardware do professor antes da aula.

- [ ] **Step 7: Commit**

```bash
git add src/routes/users.js src/server.js tests/users.test.js
git commit -m "feat: rota /users/:id/profile com gargalo de sync I/O plantado (pbkdf2Sync)"
```

---

## Task 6: Rota `/orders` com gargalo de N+1

**Files:**
- Create: `src/routes/orders.js`
- Create: `tests/orders.test.js`
- Modify: `src/server.js`

- [ ] **Step 1: Escrever teste falhando primeiro**

Criar `tests/orders.test.js`:

```js
// tests/orders.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/server.js';

test('GET /orders retorna lista com items aninhados', async () => {
  const app = createApp();
  const res = await request(app).get('/orders?limit=5');

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
  const first = res.body[0];
  assert.ok('items' in first);
  assert.ok(Array.isArray(first.items));
});
```

- [ ] **Step 2: Rodar teste — deve falhar**

```bash
npm test
```

Expected: FAIL.

- [ ] **Step 3: Criar `src/routes/orders.js` com gargalo plantado**

```js
// src/routes/orders.js
import { Router } from 'express';
import { Order, OrderItem } from '../db/index.js';

export const ordersRouter = Router();

/**
 * GARGALO PLANTADO #2 — N+1 query.
 *
 * `Order.findAll()` faz 1 query.
 * Para cada order, `OrderItem.findAll({ where: { orderId } })` faz +1 query.
 * Total: 1 + N queries. Em 5000 orders, isso seria 5001 queries.
 *
 * Aqui limitamos com ?limit (default 50) para que seja rodável,
 * mas mesmo com 50 já são 51 queries — visível no k6 e no Sequelize log.
 *
 * Fix esperado: `Order.findAll({ include: [{ model: OrderItem, as: 'items' }] })`
 * → 1 query com JOIN. Ver docs/iteracao-2-n-plus-one.md.
 */
ordersRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? '50', 10), 200);

  const orders = await Order.findAll({ limit, order: [['id', 'ASC']] });

  const result = [];
  for (const order of orders) {
    const items = await OrderItem.findAll({ where: { orderId: order.id } });
    result.push({ ...order.toJSON(), items: items.map((i) => i.toJSON()) });
  }

  res.json(result);
});
```

- [ ] **Step 4: Registrar rota em `src/server.js`**

```js
import { ordersRouter } from './routes/orders.js';
// ...
app.use('/orders', ordersRouter);
```

- [ ] **Step 5: Rodar teste — deve passar**

```bash
npm test
```

Expected: `# pass 4`.

- [ ] **Step 6: Validar N+1 visualmente (logging Sequelize ON)**

Editar temporariamente `src/db/index.js` para `logging: console.log`. Rodar:

```bash
npm start &
sleep 5
curl -s "http://localhost:3000/orders?limit=3" > /dev/null
kill %1
```

Expected: ver no log do servidor 1 SELECT em `orders` + 3 SELECTs em `order_items` (4 queries para 3 orders) — confirmando o N+1. Reverter `logging: false`.

- [ ] **Step 7: Commit**

```bash
git add src/routes/orders.js src/server.js tests/orders.test.js
git commit -m "feat: rota /orders com gargalo N+1 plantado (Sequelize sem include)"
```

---

## Task 7: Rota `/products` sem cache (desafio)

**Files:**
- Create: `src/routes/products.js`
- Create: `tests/products.test.js`
- Modify: `src/server.js`

- [ ] **Step 1: Escrever teste falhando primeiro**

Criar `tests/products.test.js`:

```js
// tests/products.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/server.js';

test('GET /products retorna lista ordenada por popularity DESC', async () => {
  const app = createApp();
  const res = await request(app).get('/products');

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 10);
  assert.ok(res.body[0].popularity >= res.body[1].popularity);
});
```

- [ ] **Step 2: Rodar teste — deve falhar**

```bash
npm test
```

Expected: FAIL.

- [ ] **Step 3: Criar `src/routes/products.js`**

```js
// src/routes/products.js
import { Router } from 'express';
import { Product } from '../db/index.js';

export const productsRouter = Router();

/**
 * GARGALO PLANTADO #3 (DESAFIO) — sem cache em hot path.
 *
 * Catálogo muda raramente, mas este endpoint recebe ~78% do tráfego
 * (cenário do quiz "hot path"). Sem cache, cada requisição vai ao DB.
 *
 * Fix esperado (do aluno, em casa): cachear resposta com node-cache
 * ou Map+TTL por 60s. Ver docs/desafio-cache.md.
 */
productsRouter.get('/', async (_req, res) => {
  const products = await Product.findAll({ order: [['popularity', 'DESC']] });
  res.json(products);
});
```

- [ ] **Step 4: Registrar rota em `src/server.js`**

```js
import { productsRouter } from './routes/products.js';
// ...
app.use('/products', productsRouter);
```

- [ ] **Step 5: Rodar teste — deve passar**

```bash
npm test
```

Expected: `# pass 5`.

- [ ] **Step 6: Commit**

```bash
git add src/routes/products.js src/server.js tests/products.test.js
git commit -m "feat: rota /products sem cache (gargalo de desafio)"
```

---

## Task 8: Scripts k6 — baseline

**Files:**
- Create: `k6/baseline.js`

- [ ] **Step 1: Criar `k6/baseline.js`**

```js
// k6/baseline.js
// Teste base contra /health — valida que o servidor responde.
// Use como sanity check antes de rodar os outros scripts.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // ramp-up
    { duration: '1m', target: 10 },   // steady
    { duration: '30s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'body has status:ok': (r) => r.json('status') === 'ok',
  });
  sleep(1);
}
```

- [ ] **Step 2: Validar contra servidor rodando**

```bash
npm start &
sleep 5
k6 run k6/baseline.js
kill %1
```

Expected: teste roda 2min total, 0 falhas, P95 < 50ms (endpoint `/health` é trivial).

- [ ] **Step 3: Commit**

```bash
git add k6/baseline.js
git commit -m "feat: k6 baseline test contra /health (ramp-up/steady/ramp-down)"
```

---

## Task 9: Scripts k6 — sync-io, n-plus-one, products-cache

**Files:**
- Create: `k6/sync-io.js`
- Create: `k6/n-plus-one.js`
- Create: `k6/products-cache.js`

- [ ] **Step 1: Criar `k6/sync-io.js`**

```js
// k6/sync-io.js
// ITERAÇÃO 1 — Sync I/O bloqueando event loop.
// Mira GET /users/:id/profile com IDs aleatórios.
// Sintoma esperado ANTES do fix: P99 explodindo, throughput plateau.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp-up agressivo
    { duration: '2m', target: 50 },    // steady com carga alta
    { duration: '30s', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'], // intencionalmente largo (vai falhar antes do fix)
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const userId = Math.floor(Math.random() * 1000) + 1;
  const res = http.get(`${BASE_URL}/users/${userId}/profile`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'has integrity': (r) => r.json('integrity') !== undefined,
  });
  sleep(0.5);
}
```

- [ ] **Step 2: Criar `k6/n-plus-one.js`**

```js
// k6/n-plus-one.js
// ITERAÇÃO 2 — N+1 query.
// Mira GET /orders?limit=50.
// Sintoma esperado ANTES do fix: throughput baixo, latência média alta,
// número de queries no Sequelize log = 51 por requisição.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 30 },
    { duration: '2m', target: 30 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/orders?limit=50`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'is array': (r) => Array.isArray(r.json()),
    'has items': (r) => r.json('0.items') !== undefined,
  });
  sleep(0.5);
}
```

- [ ] **Step 3: Criar `k6/products-cache.js`**

```js
// k6/products-cache.js
// DESAFIO — Sem cache em hot path.
// Mira GET /products. Carga ALTA (100 VUs) — esse é o hot path do app.
// Sintoma esperado ANTES do fix: P95 alto, banco no limite.
// Após fix com cache: P95 deve cair drasticamente, throughput subir 10–100×.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/products`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'is array': (r) => Array.isArray(r.json()),
    'has 200 products': (r) => r.json().length === 200,
  });
  sleep(0.5);
}
```

- [ ] **Step 4: Smoke run dos 3 scripts (rápido, só pra validar sintaxe)**

```bash
npm start &
sleep 5
# Smoke: cada um por 30s só pra validar
k6 run --duration 30s --vus 5 k6/sync-io.js
k6 run --duration 30s --vus 5 k6/n-plus-one.js
k6 run --duration 30s --vus 5 k6/products-cache.js
kill %1
```

Expected: cada um termina sem erro de sintaxe; checks passam (status 200 etc).

- [ ] **Step 5: Commit**

```bash
git add k6/sync-io.js k6/n-plus-one.js k6/products-cache.js
git commit -m "feat: scripts k6 para iteração 1 (sync-io), iteração 2 (n+1), desafio (cache)"
```

---

## Task 10: Gabaritos pedagógicos em `docs/`

**Files:**
- Create: `docs/iteracao-1-sync-io.md`
- Create: `docs/iteracao-2-n-plus-one.md`
- Create: `docs/desafio-cache.md`

- [ ] **Step 1: Criar `docs/iteracao-1-sync-io.md`**

```markdown
# Iteração 1 — Sync I/O bloqueando event loop

## Endpoint
`GET /users/:id/profile`

## Sintoma medido pelo k6 (`k6/sync-io.js`)
- P50 estável (~80–150ms — tempo do hash)
- P99 explode (>1s, escalando com VUs)
- Throughput estagna em ~10–15 RPS independente de quantos VUs adicionar
- Event loop "engasga": novas requisições enfileiram

## Causa
`crypto.pbkdf2Sync(...)` em `src/routes/users.js:23` bloqueia a thread única
do Node por ~80–150ms a cada requisição. Em modelo single-threaded com
event loop, isso pausa **todas** as requisições concorrentes.

## Fix

```js
// ANTES
const integrity = crypto
  .pbkdf2Sync(payload, 'fiap-salt', 100_000, 32, 'sha512')
  .toString('hex');

// DEPOIS
import { promisify } from 'node:util';
const pbkdf2 = promisify(crypto.pbkdf2);
// ...
const integrity = (await pbkdf2(payload, 'fiap-salt', 100_000, 32, 'sha512'))
  .toString('hex');
```

A versão async libera o event loop durante o cálculo (executa em thread
pool interna do libuv), permitindo outras requisições serem atendidas
enquanto o hash é computado.

## Resultado esperado após fix

| Métrica | Antes | Depois | Melhoria |
|---|---|---|---|
| P50 | ~120ms | ~120ms | igual (mesmo trabalho) |
| P95 | ~600ms | ~150ms | 4× |
| P99 | ~3000ms | ~200ms | 15× |
| Throughput | ~15 RPS | ~50 RPS (= VUs) | 3× |

> Os números acima são referência; resultados reais variam por hardware.
> O importante é a **forma da curva**: P99 colapsa para perto do P50.

## Conceito ensinado
- Event loop em Node single-thread
- Diferença entre operação síncrona e async I/O
- Por que P99 importa mais que a média
- Saturação por bloqueio (não por capacidade)
```

- [ ] **Step 2: Criar `docs/iteracao-2-n-plus-one.md`**

```markdown
# Iteração 2 — N+1 Query

## Endpoint
`GET /orders?limit=50`

## Sintoma medido pelo k6 (`k6/n-plus-one.js`)
- Throughput baixo (~5–10 RPS com 30 VUs)
- Latência média alta (~1–2s por requisição)
- No log do Sequelize (com `logging: console.log`): 51 SELECTs por requisição
  (1 em `orders` + 50 em `order_items`)

## Causa
Em `src/routes/orders.js`, o loop `for (const order of orders)` faz uma
query separada para cada `order` buscar seus `items`. Padrão clássico
de N+1.

## Fix

```js
// ANTES
const orders = await Order.findAll({ limit, order: [['id', 'ASC']] });
const result = [];
for (const order of orders) {
  const items = await OrderItem.findAll({ where: { orderId: order.id } });
  result.push({ ...order.toJSON(), items: items.map((i) => i.toJSON()) });
}

// DEPOIS
const orders = await Order.findAll({
  limit,
  order: [['id', 'ASC']],
  include: [{ model: OrderItem, as: 'items' }],
});
res.json(orders);
```

`include` faz Sequelize emitir 1 query com `LEFT OUTER JOIN`. 51 queries
viram 1.

## Resultado esperado após fix

| Métrica | Antes | Depois | Melhoria |
|---|---|---|---|
| Queries por request | 51 | 1 | 51× |
| P95 | ~1500ms | ~80ms | 18× |
| Throughput | ~8 RPS | ~200 RPS | 25× |

## Conceito ensinado
- ORMs e o pitfall do lazy loading
- Custo de round-trips ao banco
- Throughput como métrica primária quando latência segue volume
```

- [ ] **Step 3: Criar `docs/desafio-cache.md`**

```markdown
# Desafio — Cache em Hot Path

## Endpoint
`GET /products`

## Cenário
Este endpoint recebe 78% do tráfego do app (hot path). O catálogo de produtos muda raramente (poucas vezes por dia). Sem cache, cada requisição consulta o DB.

## Tarefa
1. Rodar o baseline antes:
   ```bash
   k6 run k6/products-cache.js
   ```
   Anotar: P50, P95, P99, RPS.

2. Implementar cache em `src/routes/products.js` com TTL de 60s. Pode usar:
   - **`node-cache`** (simples, npm install): `npm install node-cache`
   - **`Map` + `Date.now()`** (sem dependência): solução abaixo

3. Re-rodar o k6 e comparar.

## Solução de referência (Map + TTL)

```js
// src/routes/products.js
import { Router } from 'express';
import { Product } from '../db/index.js';

export const productsRouter = Router();

const CACHE_TTL_MS = 60_000;
let cache = null;
let cacheExpiresAt = 0;

productsRouter.get('/', async (_req, res) => {
  const now = Date.now();
  if (cache && now < cacheExpiresAt) {
    return res.json(cache);
  }
  const products = await Product.findAll({ order: [['popularity', 'DESC']] });
  cache = products;
  cacheExpiresAt = now + CACHE_TTL_MS;
  res.json(products);
});
```

## Resultado esperado após fix

| Métrica | Antes | Depois | Melhoria |
|---|---|---|---|
| P95 | ~800ms | ~5ms | 160× |
| Throughput | ~50 RPS | ~5000+ RPS | 100× |
| Carga no DB | 100% das reqs | <1% (1 req a cada 60s) | massiva |

## Entregável
- Fork do repo `fiap-2026-1-perf` no GitHub do aluno
- PR/branch com a alteração
- Screenshot dos dois outputs do k6 (antes e depois)
- Postar link no Teams da disciplina

## Conceito ensinado
- Identificação de hot path (regra de Pareto)
- Trade-off freshness × performance
- Quando cachear (alta leitura, baixa escrita)
- Por que otimizar o hot path rende desproporcionalmente mais
```

- [ ] **Step 4: Commit**

```bash
git add docs/
git commit -m "docs: gabaritos pedagógicos das 3 iterações (sync-io, n+1, cache)"
```

---

## Task 11: README do repo

**Files:**
- Create: `README.md`

- [ ] **Step 1: Criar `README.md`**

```markdown
# fiap-2026-1-perf

Laboratório de testes de carga — **FIAP 3SIZ Aula 11 (2026/1)**.

API Node.js deliberadamente lenta com 3 gargalos plantados, scripts k6 prontos para medir cada um, e gabaritos pedagógicos. Os alunos diagnosticam, corrigem e re-medem.

## Pré-requisitos

- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **k6** ([instalação](https://grafana.com/docs/k6/latest/set-up/install-k6/)):
  - Windows: `winget install k6 --source winget`
  - macOS: `brew install k6`
  - Linux (Debian/Ubuntu):
    ```bash
    sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update && sudo apt-get install k6
    ```
- Validar: `k6 version`

## Setup (3 comandos)

```bash
git clone https://github.com/josercf/fiap-2026-1-perf.git
cd fiap-2026-1-perf
npm install && npm start
```

Na primeira execução, um seed automático cria `database.sqlite` com:
- 1.000 usuários
- 200 produtos
- 5.000 pedidos
- 15.000 itens de pedido

(Demora ~30–60s — só na primeira vez.)

Servidor em `http://localhost:3000`.

## Endpoints

| Método | Caminho | Descrição | Gargalo plantado |
|---|---|---|---|
| GET | `/health` | Sanity check | nenhum |
| GET | `/users/:id/profile` | Perfil + integrity hash | **#1 sync I/O** |
| GET | `/orders?limit=N` | Pedidos com itens | **#2 N+1 query** |
| GET | `/products` | Catálogo ordenado por popularidade | **#3 sem cache** (desafio) |

## Roteiro pedagógico

### Iteração 1 — Sync I/O (em aula)
```bash
k6 run k6/sync-io.js
```
Diagnóstico: P50 estável, P99 explode. Sintoma de event loop bloqueado.
Gabarito: [`docs/iteracao-1-sync-io.md`](docs/iteracao-1-sync-io.md).

### Iteração 2 — N+1 (em aula)
```bash
k6 run k6/n-plus-one.js
```
Diagnóstico: throughput colapsa, log mostra 51 queries por request.
Gabarito: [`docs/iteracao-2-n-plus-one.md`](docs/iteracao-2-n-plus-one.md).

### Desafio — Cache em hot path (casa)
```bash
k6 run k6/products-cache.js
```
Implementar cache, comparar antes/depois.
Roteiro: [`docs/desafio-cache.md`](docs/desafio-cache.md).

## Scripts npm

| Comando | O que faz |
|---|---|
| `npm start` | Sobe o servidor (auto-seed na primeira vez) |
| `npm run seed` | Recria DB do zero (`force: true`) |
| `npm test` | Roda testes sanity (`node --test`) |
| `npm run reset` | Apaga DB e recria |

## Estrutura

```
fiap-2026-1-perf/
├── src/
│   ├── server.js
│   ├── routes/        ← health.js, users.js, orders.js, products.js
│   └── db/            ← Sequelize bootstrap, models, seed
├── tests/             ← node:test + supertest
├── k6/                ← baseline.js + 3 scripts de cenário
└── docs/              ← gabaritos das iterações
```

## Licença

Material didático FIAP 3SIZ — uso restrito a alunos da disciplina.
Copyright © 2026 Prof. José Romualdo da Costa Filho.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README com setup, endpoints, roteiro pedagógico e scripts"
```

---

## Task 12: Validação end-to-end do repo

**Files:** (nenhum criado/editado — só validação)

- [ ] **Step 1: Limpar e re-instalar do zero**

```bash
cd /Users/joseromualdocostafilho/Projects/FIAP/fiap-2026-1-perf
rm -rf node_modules database.sqlite package-lock.json
npm install
```

Expected: instalação limpa.

- [ ] **Step 2: Rodar todos os testes sanity**

```bash
npm test
```

Expected: `# pass 5` (health + users [2 testes] + orders + products).

- [ ] **Step 3: Subir servidor e rodar baseline k6**

```bash
npm start &
sleep 60   # espera seed
k6 run k6/baseline.js
kill %1
```

Expected: baseline passa thresholds, 0 erros.

- [ ] **Step 4: Capturar números reais para os gabaritos**

Rodar cada cenário e anotar P50/P95/P99/RPS reais para o hardware do professor. Atualizar a tabela "Resultado esperado" nos arquivos `docs/iteracao-*.md` com os números reais (substituir os valores de referência).

```bash
npm start &
sleep 5

k6 run k6/sync-io.js > /tmp/k6-sync-io-baseline.txt
k6 run k6/n-plus-one.js > /tmp/k6-n-plus-one-baseline.txt
k6 run k6/products-cache.js > /tmp/k6-products-baseline.txt

kill %1
```

Aplicar os fixes dos gabaritos manualmente, rodar novamente, capturar pós-fix:

```bash
# (após aplicar fix da iteração 1)
npm start &
sleep 5
k6 run k6/sync-io.js > /tmp/k6-sync-io-fixed.txt
kill %1
# (reverter fix; aplicar fix da iteração 2; rodar; reverter)
# (aplicar fix do desafio; rodar; reverter)
```

Atualizar tabelas dos gabaritos com `[antes, depois]` reais.

- [ ] **Step 5: Push para o GitHub (criar repo se ainda não existir)**

> **Confirmar com o professor antes** — push é ação visível.

```bash
# Se o repo no GitHub ainda não foi criado:
gh repo create josercf/fiap-2026-1-perf --public --source=. --remote=origin --push

# Senão:
git remote add origin git@github.com:josercf/fiap-2026-1-perf.git
git branch -M main
git push -u origin main
```

- [ ] **Step 6: Commit final dos números reais (se houve update nos gabaritos)**

```bash
git add docs/
git commit -m "docs: atualiza gabaritos com números reais medidos no hardware do professor"
git push
```

---

# STREAM B — Slides `aula11.html`

> A partir daqui, o diretório de trabalho é `/Users/joseromualdocostafilho/Projects/FIAP/FIAP-2026-1-3SIZ`.

## Task 13: Esqueleto reescrito do `aula11.html`

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

Substituição completa do conteúdo de `<div class="slides">`. Cabeçalho HTML, scripts e CDNs ficam intactos.

- [ ] **Step 1: Reescrever `aula11.html` com esqueleto vazio (mantém `<head>` + scripts; troca `<div class="slides">…</div>`)**

Manter linhas 1–17 (head + abertura `<div class="reveal"><div class="slides">`) e linhas 502–530 (fechamento + scripts) **idênticas** ao arquivo atual. Substituir tudo entre `<div class="slides">` e seu fechamento `</div>` por:

```html
      <!-- ==================== 1. CAPA ==================== -->
      <section class="cover-slide">
        <img src="../assets/img/fiap-logo-graduacao.png" alt="FIAP Graduação" class="fiap-logo-full">
      </section>

      <!-- ==================== 2. TÍTULO ==================== -->
      <section class="title-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="title-card">
          <div class="accent-bar"></div>
          <h1>Testes de Carga</h1>
          <h2>Performance e Resiliência de Sistemas</h2>
          <h3>Prof. José Romualdo</h3>
          <h4>Data: 05/05/2026</h4>
        </div>
        <div class="lesson-bar">11 - Testes de Carga</div>
      </section>

      <!-- ==================== 3. AGENDA ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Agenda</h2></div>
        <table>
          <thead><tr><th>Bloco</th><th>Horário</th><th>Conteúdo</th></tr></thead>
          <tbody>
            <tr><td><strong>Bloco 1</strong></td><td>19h30 – 21h00</td><td>Fundamentos: tipos de teste, métricas, ramp-up/down, hot path, instalação k6</td></tr>
            <tr><td><strong>Intervalo</strong></td><td>21h00 – 21h20</td><td>☕ Pausa</td></tr>
            <tr><td><strong>Bloco 2</strong></td><td>21h20 – 22h45</td><td>Laboratório guiado: 2 iterações de otimização + desafio de casa</td></tr>
          </tbody>
        </table>
        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">3</div></div>
      </section>

      <!-- ==================== 4. SECTION BLOCO 1 ==================== -->
      <section class="section-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="accent-bar"></div>
        <h2>Bloco 1<br>Fundamentos de Testes de Carga</h2>
        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">4</div></div>
      </section>

      <!-- TODO: slides 5–16 nas próximas tasks -->

      <!-- ==================== 17. INTERVALO ==================== -->
      <section class="break-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="break-message">
          <h2>Intervalo</h2>
          <p>21h00 – 21h20</p>
          <p>☕ Aproveite para descansar e recarregar</p>
        </div>
        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">17</div></div>
      </section>

      <!-- ==================== 18. SECTION BLOCO 2 ==================== -->
      <section class="section-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="accent-bar"></div>
        <h2>Bloco 2<br>Otimização Iterativa de uma API Real</h2>
        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">18</div></div>
      </section>

      <!-- TODO: slides 19–26 nas próximas tasks -->

      <!-- ==================== 27. DÚVIDAS ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Dúvidas ou Curiosidades?</h2></div>
        <div style="display:flex; align-items:center; justify-content:center; flex:1; font-size:4em; color: var(--fiap-dark); font-weight:800; opacity:0.15; margin-top:40px;">?</div>
        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">27</div></div>
      </section>

      <!-- ==================== 28. ENCERRAMENTO ==================== -->
      <section class="end-slide">
        <img src="../assets/img/fiap-logo-graduacao.png" alt="FIAP Graduação" style="max-width:350px;">
        <div class="copyright">
          Copyright &copy; 2026<br>
          Prof.º José Romualdo da Costa Filho<br><br>
          Todos direitos reservados. Reprodução ou divulgação total ou parcial<br>
          deste documento é expressamente proibido sem o consentimento formal,<br>
          por escrito, do Professor (autor).
        </div>
      </section>
```

- [ ] **Step 2: Validar HTML válido (abrir no Chrome)**

```bash
cd /Users/joseromualdocostafilho/Projects/FIAP/FIAP-2026-1-3SIZ/aulas-2sem
python3 -m http.server 8080 &
```

Abrir `http://localhost:8080/aulas/aula11.html` em Chrome. Esperado:
- Capa, Título, Agenda, Section Bloco 1, Intervalo, Section Bloco 2, Dúvidas, Encerramento renderizam.
- Console sem erros JS.
- Slides "TODO" são placeholders aceitáveis nesta etapa.

Parar o servidor: `kill %1`.

- [ ] **Step 3: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "refactor(aula11): esqueleto reescrito (capa/título/agenda/sections/break/end)"
```

---

## Task 14: Slide 5 — "Por que testar carga?" (motivacional)

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html` (substitui o comentário `<!-- TODO: slides 5–16 nas próximas tasks -->` parcialmente)

- [ ] **Step 1: Inserir slide 5 logo após o slide 4 (section Bloco 1)**

```html
      <!-- ==================== 5. POR QUE TESTAR CARGA? ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Por que testar carga?</h2></div>

        <p style="font-size:0.9em">Toda Black Friday, sistemas que passam o ano <em>aparentemente</em> saudáveis caem em horas:</p>
        <ul style="font-size:0.85em">
          <li><strong>Conexões ao banco</strong> esgotam: filas, timeouts, 503</li>
          <li><strong>Memory leaks</strong> que demoram horas para aparecer estouram a JVM/Node</li>
          <li><strong>Thread/event loop starvation</strong> deixa o app vivo mas inerte</li>
          <li><strong>Caches frios</strong> e conexões TLS recém-abertas multiplicam latência</li>
        </ul>

        <div style="margin-top:1.2em; padding:1em 1.4em; background:#fdedec; border-left:5px solid #ED145B; border-radius:0 8px 8px 0;">
          <p style="margin:0; font-size:0.9em; font-weight:600; color:#1E1E2C;">Como descobrir <em>antes</em> do dia D — e não junto com os clientes?</p>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">5</div></div>
      </section>
```

- [ ] **Step 2: Validar visual no navegador**

Recarregar `http://localhost:8080/aulas/aula11.html`, navegar até slide 5. Esperado: título, lista, callout em vermelho FIAP.

- [ ] **Step 3: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slide 5 - Por que testar carga (abertura motivacional Black Friday)"
```

---

## Task 15: Slide 6 — Tipos de teste de performance (4 cards SVG VU×tempo)

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

- [ ] **Step 1: Inserir slide 6 após slide 5**

Cada card é um mini-SVG mostrando a forma da curva VU×tempo característica.

```html
      <!-- ==================== 6. TIPOS DE TESTE ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Tipos de teste de performance</h2></div>

        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; margin-top:0.5em;">

          <div style="border:2px solid #ED145B; border-radius:10px; padding:10px; background:white;">
            <h3 style="margin:0 0 6px; font-size:0.85em; color:#ED145B;">Load</h3>
            <svg viewBox="0 0 100 60" style="width:100%; height:auto;" aria-label="Curva load: sobe e mantém">
              <line x1="5" y1="55" x2="95" y2="55" stroke="#ccc" stroke-width="0.5"/>
              <line x1="5" y1="55" x2="5" y2="5" stroke="#ccc" stroke-width="0.5"/>
              <polyline points="5,55 25,20 75,20 95,55" fill="none" stroke="#ED145B" stroke-width="2"/>
              <text x="50" y="64" font-size="6" text-anchor="middle" fill="#666">tempo</text>
            </svg>
            <p style="font-size:0.65em; margin:6px 0 0; color:#1E1E2C;">Carga <em>esperada</em> sustentada. Mede regime estacionário.</p>
          </div>

          <div style="border:2px solid #ED145B; border-radius:10px; padding:10px; background:white;">
            <h3 style="margin:0 0 6px; font-size:0.85em; color:#ED145B;">Stress</h3>
            <svg viewBox="0 0 100 60" style="width:100%; height:auto;" aria-label="Curva stress: rampa contínua">
              <line x1="5" y1="55" x2="95" y2="55" stroke="#ccc" stroke-width="0.5"/>
              <line x1="5" y1="55" x2="5" y2="5" stroke="#ccc" stroke-width="0.5"/>
              <polyline points="5,55 95,8" fill="none" stroke="#ED145B" stroke-width="2"/>
              <text x="50" y="64" font-size="6" text-anchor="middle" fill="#666">tempo</text>
            </svg>
            <p style="font-size:0.65em; margin:6px 0 0; color:#1E1E2C;">Sobe até <em>quebrar</em>. Descobre limite máximo.</p>
          </div>

          <div style="border:2px solid #ED145B; border-radius:10px; padding:10px; background:white;">
            <h3 style="margin:0 0 6px; font-size:0.85em; color:#ED145B;">Spike</h3>
            <svg viewBox="0 0 100 60" style="width:100%; height:auto;" aria-label="Curva spike: pulo abrupto">
              <line x1="5" y1="55" x2="95" y2="55" stroke="#ccc" stroke-width="0.5"/>
              <line x1="5" y1="55" x2="5" y2="5" stroke="#ccc" stroke-width="0.5"/>
              <polyline points="5,55 40,55 42,8 70,8 72,55 95,55" fill="none" stroke="#ED145B" stroke-width="2"/>
              <text x="50" y="64" font-size="6" text-anchor="middle" fill="#666">tempo</text>
            </svg>
            <p style="font-size:0.65em; margin:6px 0 0; color:#1E1E2C;">Pico <em>abrupto</em>. Simula flash sale, viral, deploy.</p>
          </div>

          <div style="border:2px solid #ED145B; border-radius:10px; padding:10px; background:white;">
            <h3 style="margin:0 0 6px; font-size:0.85em; color:#ED145B;">Soak</h3>
            <svg viewBox="0 0 100 60" style="width:100%; height:auto;" aria-label="Curva soak: longa duração">
              <line x1="5" y1="55" x2="95" y2="55" stroke="#ccc" stroke-width="0.5"/>
              <line x1="5" y1="55" x2="5" y2="5" stroke="#ccc" stroke-width="0.5"/>
              <polyline points="5,55 15,30 90,30 95,55" fill="none" stroke="#ED145B" stroke-width="2"/>
              <text x="50" y="64" font-size="6" text-anchor="middle" fill="#666">tempo (horas)</text>
            </svg>
            <p style="font-size:0.65em; margin:6px 0 0; color:#1E1E2C;">Carga moderada por <em>horas</em>. Detecta vazamento, fadiga.</p>
          </div>

        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">6</div></div>
      </section>
```

- [ ] **Step 2: Validar visual**

Recarregar página, ir ao slide 6. Esperado: 4 cards lado a lado com curvas SVG. Curvas devem ser visualmente distintas: trapézio (load), rampa contínua (stress), retângulo (spike), trapézio largo (soak).

- [ ] **Step 3: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slide 6 - Tipos de teste com 4 SVGs VUxtempo"
```

---

## Task 16: Slide 7 — Ramp-up / Steady / Ramp-down (SVG anotado)

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

- [ ] **Step 1: Inserir slide 7 após slide 6**

```html
      <!-- ==================== 7. RAMP-UP / STEADY / RAMP-DOWN ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Anatomia da carga: ramp-up · steady · ramp-down</h2></div>

        <div style="display:flex; gap:20px; align-items:center;">
          <svg viewBox="0 0 400 180" style="width:60%; height:auto;" aria-label="Diagrama ramp-up steady ramp-down">
            <!-- eixos -->
            <line x1="30" y1="160" x2="380" y2="160" stroke="#1E1E2C" stroke-width="1"/>
            <line x1="30" y1="160" x2="30" y2="20" stroke="#1E1E2C" stroke-width="1"/>
            <text x="15" y="90" font-size="10" fill="#1E1E2C" transform="rotate(-90 15 90)">VUs</text>
            <text x="200" y="178" font-size="10" fill="#1E1E2C" text-anchor="middle">tempo</text>

            <!-- curva: ramp-up linear, steady plano, ramp-down linear -->
            <polyline points="30,160 130,40 280,40 380,160"
                      fill="none" stroke="#ED145B" stroke-width="3"/>

            <!-- linhas verticais separadoras -->
            <line x1="130" y1="160" x2="130" y2="40" stroke="#888" stroke-width="0.5" stroke-dasharray="3"/>
            <line x1="280" y1="160" x2="280" y2="40" stroke="#888" stroke-width="0.5" stroke-dasharray="3"/>

            <!-- labels das fases -->
            <text x="80" y="100" font-size="11" fill="#ED145B" font-weight="700" text-anchor="middle">ramp-up</text>
            <text x="205" y="35" font-size="11" fill="#1E1E2C" font-weight="700" text-anchor="middle">steady</text>
            <text x="330" y="100" font-size="11" fill="#ED145B" font-weight="700" text-anchor="middle">ramp-down</text>

            <!-- marcador animado percorrendo a curva -->
            <circle r="4" fill="#00A859">
              <animateMotion dur="6s" repeatCount="indefinite"
                             path="M30,160 L130,40 L280,40 L380,160"/>
            </circle>
          </svg>

          <div style="flex:1; font-size:0.78em;">
            <p style="margin:0 0 0.7em;"><strong style="color:#ED145B;">Ramp-up</strong> — sobe gradual.<br>
              <em>Por quê?</em> Aquece caches, JIT, conexões, evita falso positivo de cold-start.</p>
            <p style="margin:0 0 0.7em;"><strong style="color:#1E1E2C;">Steady</strong> — carga constante.<br>
              <em>Por quê?</em> Aqui se medem P95/P99 confiáveis — o sistema atingiu regime estacionário.</p>
            <p style="margin:0;"><strong style="color:#ED145B;">Ramp-down</strong> — desce gradual.<br>
              <em>Por quê?</em> Detecta recursos não liberados (conexões abertas, memória não devolvida).</p>
          </div>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">7</div></div>
      </section>
```

- [ ] **Step 2: Validar — círculo verde deve animar percorrendo a curva**

Recarregar slide 7. Esperado: trapézio em rosa FIAP, círculo verde se movendo continuamente da base esquerda → topo → topo direito → base direita, em loop de 6s.

- [ ] **Step 3: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slide 7 - ramp-up/steady/ramp-down com SVG animado (animateMotion)"
```

---

## Task 17: Slides 8–11 — As 4 métricas fundamentais

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

> Implementar 4 slides em sequência. Para evitar duplicação, todos seguem layout similar: título + corpo (texto à esquerda, SVG à direita).

- [ ] **Step 1: Slide 8 — Throughput (RPS)**

```html
      <!-- ==================== 8. MÉTRICA: THROUGHPUT ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Métrica 1 — Throughput (RPS)</h2></div>

        <div style="display:flex; gap:25px; align-items:center; margin-top:0.4em;">
          <div style="flex:1; font-size:0.82em;">
            <p><strong>Definição:</strong> requisições processadas por segundo.</p>
            <p><strong>Fórmula:</strong> <code>requests / segundos</code></p>
            <p><strong>Quando importa:</strong> capacidade total — quantos clientes simultâneos seu sistema atende?</p>
            <div style="margin-top:1em; padding:0.8em 1em; background:#eafaf1; border-left:4px solid #00A859; border-radius:0 8px 8px 0;">
              <p style="margin:0; font-size:0.95em;"><em>Throughput é <strong>capacidade</strong>; latência é <strong>experiência</strong>.</em></p>
            </div>
          </div>
          <svg viewBox="0 0 240 120" style="width:40%; height:auto;" aria-label="100 RPS x 60s = 6000 reqs">
            <rect x="10" y="40" width="220" height="40" fill="#ED145B" opacity="0.15" stroke="#ED145B" stroke-width="2"/>
            <text x="120" y="35" font-size="11" fill="#1E1E2C" text-anchor="middle">100 RPS × 60s</text>
            <text x="120" y="65" font-size="22" fill="#ED145B" text-anchor="middle" font-weight="800">6.000 reqs</text>
            <text x="120" y="100" font-size="9" fill="#666" text-anchor="middle">no k6: <tspan font-family="monospace">http_reqs</tspan></text>
          </svg>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">8</div></div>
      </section>
```

- [ ] **Step 2: Slide 9 — Latência e percentis (slide-chave, com histograma SVG)**

```html
      <!-- ==================== 9. MÉTRICA: LATÊNCIA E PERCENTIS ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Métrica 2 — Latência: P50 · P95 · P99</h2></div>

        <div style="display:flex; gap:20px; align-items:flex-start; margin-top:0.3em;">
          <svg viewBox="0 0 360 200" style="width:55%; height:auto;" aria-label="Histograma de latência com P50 P95 P99">
            <!-- eixos -->
            <line x1="30" y1="170" x2="350" y2="170" stroke="#1E1E2C"/>
            <line x1="30" y1="170" x2="30" y2="20" stroke="#1E1E2C"/>
            <text x="190" y="188" font-size="10" fill="#1E1E2C" text-anchor="middle">latência →</text>

            <!-- barras do histograma (forma assimétrica com cauda longa) -->
            <rect x="35"  y="120" width="14" height="50" fill="#ED145B" opacity="0.5"/>
            <rect x="50"  y="60"  width="14" height="110" fill="#ED145B" opacity="0.7"/>
            <rect x="65"  y="40"  width="14" height="130" fill="#ED145B" opacity="0.9"/>
            <rect x="80"  y="55"  width="14" height="115" fill="#ED145B" opacity="0.8"/>
            <rect x="95"  y="80"  width="14" height="90" fill="#ED145B" opacity="0.7"/>
            <rect x="110" y="105" width="14" height="65" fill="#ED145B" opacity="0.6"/>
            <rect x="125" y="125" width="14" height="45" fill="#ED145B" opacity="0.5"/>
            <rect x="140" y="140" width="14" height="30" fill="#ED145B" opacity="0.4"/>
            <rect x="160" y="148" width="14" height="22" fill="#ED145B" opacity="0.4"/>
            <rect x="180" y="152" width="14" height="18" fill="#ED145B" opacity="0.35"/>
            <rect x="200" y="157" width="14" height="13" fill="#ED145B" opacity="0.3"/>
            <rect x="225" y="160" width="14" height="10" fill="#ED145B" opacity="0.3"/>
            <rect x="255" y="163" width="14" height="7"  fill="#ED145B" opacity="0.25"/>
            <rect x="290" y="165" width="14" height="5"  fill="#ED145B" opacity="0.2"/>
            <rect x="325" y="166" width="14" height="4"  fill="#ED145B" opacity="0.2"/>

            <!-- linhas verticais P50, P95, P99 -->
            <line x1="80" y1="170" x2="80" y2="15" stroke="#00A859" stroke-width="2" stroke-dasharray="4"/>
            <text x="80" y="13" font-size="11" fill="#00A859" text-anchor="middle" font-weight="700">P50</text>

            <line x1="200" y1="170" x2="200" y2="15" stroke="#F39C12" stroke-width="2" stroke-dasharray="4"/>
            <text x="200" y="13" font-size="11" fill="#F39C12" text-anchor="middle" font-weight="700">P95</text>

            <line x1="295" y1="170" x2="295" y2="15" stroke="#C0392B" stroke-width="2" stroke-dasharray="4"/>
            <text x="295" y="13" font-size="11" fill="#C0392B" text-anchor="middle" font-weight="700">P99</text>
          </svg>

          <div style="flex:1; font-size:0.78em;">
            <p style="margin:0 0 0.5em;"><strong style="color:#00A859;">P50 (mediana)</strong> — metade das requisições é mais rápida que isso. <em>Não conta a história inteira.</em></p>
            <p style="margin:0 0 0.5em;"><strong style="color:#F39C12;">P95</strong> — 95% terminam em até esse tempo. 5% sentem mais.</p>
            <p style="margin:0 0 0.5em;"><strong style="color:#C0392B;">P99</strong> — 1 em 100 requisições. <strong>O usuário que tweeta sobre a sua app.</strong></p>
            <div style="margin-top:0.8em; padding:0.6em 0.9em; background:#fdedec; border-left:4px solid #C0392B; border-radius:0 6px 6px 0;">
              <p style="margin:0; font-size:0.92em;"><em>A média esconde a cauda. O P99 conta a verdade da pior experiência real.</em></p>
            </div>
          </div>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">9</div></div>
      </section>
```

- [ ] **Step 3: Slide 10 — Error Rate**

```html
      <!-- ==================== 10. MÉTRICA: ERROR RATE ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Métrica 3 — Error Rate</h2></div>

        <p style="font-size:0.85em;">Percentual de requisições que <strong>falharam</strong>. O que conta como falha?</p>
        <ul style="font-size:0.8em;">
          <li>HTTP <code>5xx</code> (server error)</li>
          <li>Timeout (cliente desistiu antes da resposta)</li>
          <li>Body inválido ou inesperado (validar com <code>check()</code> no k6)</li>
          <li>HTTP <code>4xx</code> em fluxos onde não deveriam aparecer</li>
        </ul>

        <table style="margin-top:0.6em; font-size:0.78em;">
          <thead>
            <tr><th>Faixa</th><th>Significado</th><th>Ação</th></tr>
          </thead>
          <tbody>
            <tr><td><strong style="color:#00A859;">&lt; 0,1%</strong></td><td>Saudável</td><td>Continuar monitorando</td></tr>
            <tr><td><strong style="color:#F39C12;">0,1% – 1%</strong></td><td>Atenção</td><td>Investigar erros, identificar padrão</td></tr>
            <tr><td><strong style="color:#E67E22;">1% – 5%</strong></td><td>Crítico</td><td>Provavelmente saturação ou bug; agir hoje</td></tr>
            <tr><td><strong style="color:#C0392B;">&gt; 5%</strong></td><td>Degradação aberta</td><td>Rollback, escalar, abrir incidente</td></tr>
          </tbody>
        </table>

        <p style="margin-top:0.6em; font-size:0.78em; color:#666;">No k6: <code>http_req_failed</code> — threshold típico: <code>['rate&lt;0.01']</code></p>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">10</div></div>
      </section>
```

- [ ] **Step 4: Slide 11 — Saturação**

```html
      <!-- ==================== 11. MÉTRICA: SATURAÇÃO ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Métrica 4 — Saturação</h2></div>

        <div style="display:flex; gap:25px; align-items:center;">
          <div style="flex:1; font-size:0.82em;">
            <p><strong>Definição</strong> (Brendan Gregg, USE Method):<br>
              <em>Demanda além da capacidade que o recurso pode atender no momento.</em></p>
            <p><strong>Recursos típicos a observar:</strong></p>
            <ul style="font-size:0.95em;">
              <li>CPU (cores ocupadas)</li>
              <li>Memória (RAM, heap)</li>
              <li><strong style="color:#ED145B;">Event loop lag</strong> (Node)</li>
              <li>Connection pool do DB</li>
              <li>Threads (em runtimes thread-based)</li>
            </ul>
            <p style="font-size:0.78em; color:#666;">k6 mede do <em>lado do cliente</em>. Saturação real é vista no servidor (APM, Prometheus, top, etc.).</p>
          </div>
          <svg viewBox="0 0 200 220" style="width:30%; height:auto;" aria-label="Capacidade enchendo e transbordando">
            <!-- container -->
            <rect x="50" y="20" width="100" height="180" fill="none" stroke="#1E1E2C" stroke-width="2"/>
            <!-- nível -->
            <rect x="50" y="60" width="100" height="140" fill="#ED145B" opacity="0.7">
              <animate attributeName="y" values="80;40;20;30;40" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="height" values="120;160;180;170;160" dur="4s" repeatCount="indefinite"/>
            </rect>
            <!-- gota transbordando -->
            <circle cx="100" cy="15" r="3" fill="#C0392B">
              <animate attributeName="cy" values="15;5;25" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
            </circle>
            <text x="100" y="215" font-size="10" fill="#1E1E2C" text-anchor="middle" font-weight="700">capacidade</text>
          </svg>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">11</div></div>
      </section>
```

- [ ] **Step 5: Validar slides 8–11 visualmente**

Recarregar e navegar 8→9→10→11. Esperado: layout consistente, SVGs nítidos, animações funcionando (saturação enche e transborda).

- [ ] **Step 6: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slides 8-11 - 4 métricas (RPS, percentis, error rate, saturação) com SVGs"
```

---

## Task 18: Slide 12 — Como ler um relatório do k6

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

> Esta tarefa cria um placeholder textual para o screenshot. A imagem real virá da Task 25.

- [ ] **Step 1: Inserir slide 12**

```html
      <!-- ==================== 12. COMO LER O RELATÓRIO DO K6 ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Como ler um relatório do k6</h2></div>

        <div style="display:flex; gap:18px; align-items:flex-start;">
          <div style="flex:1.4;">
            <img src="../assets/img/k6-output-anatomy.png"
                 alt="Output anotado de execução do k6"
                 style="width:100%; border-radius:8px; border:1px solid #ddd;"
                 onerror="this.outerHTML='&lt;div style=&quot;background:#1E1E2C;color:#E0E0E0;font-family:monospace;font-size:0.65em;padding:12px;border-radius:8px;line-height:1.4;&quot;&gt;     ✓ status 200<br>     ✓ has integrity<br><br>     checks.........................: 100.00% ✓ 5982 ✗ 0<br>     <strong style=&quot;color:#F39C12&quot;&gt;data_received...................: 4.8 MB  80 kB/s&lt;/strong&gt;<br>     data_sent.......................: 580 kB  9.7 kB/s<br>     <strong style=&quot;color:#00A859&quot;&gt;http_req_duration...............: avg=145ms min=12ms med=120ms&lt;/strong&gt;<br>       <strong style=&quot;color:#F39C12&quot;&gt;{ expected_response:true }: avg=145ms p(95)=510ms p(99)=2.1s&lt;/strong&gt;<br>     <strong style=&quot;color:#C0392B&quot;&gt;http_req_failed.................: 0.00%   ✓ 0 ✗ 5982&lt;/strong&gt;<br>     <strong style=&quot;color:#ED145B&quot;&gt;http_reqs.......................: 5982    99.7/s&lt;/strong&gt;<br>     iteration_duration..............: avg=1.15s min=1.01s med=1.12s<br>     iterations......................: 5982    99.7/s<br>     <strong style=&quot;color:#00A859&quot;&gt;vus.............................: 50      min=0 max=50&lt;/strong&gt;<br>     vus_max.........................: 50<br>&lt;/div&gt;'">
          </div>
          <div style="flex:1; font-size:0.7em;">
            <p style="margin:0 0 0.4em;"><strong style="color:#ED145B;">http_reqs</strong> — total + RPS médio. <em>Sua taxa de produção.</em></p>
            <p style="margin:0 0 0.4em;"><strong style="color:#00A859;">http_req_duration</strong> com <strong>p(95) / p(99)</strong> — latência percentilada. <em>Olhe aqui antes da média.</em></p>
            <p style="margin:0 0 0.4em;"><strong style="color:#C0392B;">http_req_failed</strong> — taxa de falha. <em>Threshold típico: &lt;1%.</em></p>
            <p style="margin:0 0 0.4em;"><strong>iteration_duration</strong> — tempo total de uma iteração (req + sleep). <em>Útil para entender ritmo do VU.</em></p>
            <p style="margin:0;"><strong>vus / vus_max</strong> — quantos usuários virtuais ativos. <em>Confirma que o ramp-up rodou.</em></p>
          </div>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">12</div></div>
      </section>
```

> Nota: o `onerror` no `<img>` serve como **fallback textual** caso o screenshot ainda não exista (ASCII art de output do k6 com cores via spans). Quando a imagem real for adicionada na Task 25, o fallback fica inativo.

- [ ] **Step 2: Validar visual**

Antes do screenshot existir, slide deve mostrar o fallback textual (terminal escuro com texto colorido). Após Task 25, mostra a imagem real.

- [ ] **Step 3: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slide 12 - como ler relatório k6 (com fallback textual antes do screenshot)"
```

---

## Task 19: Slide 13 — Hot Path

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

- [ ] **Step 1: Inserir slide 13**

```html
      <!-- ==================== 13. HOT PATH ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Hot Path — onde otimizar primeiro</h2></div>

        <div style="display:flex; gap:25px; align-items:center;">
          <div style="flex:1.1; font-size:0.8em;">
            <p><strong>Hot path</strong> = caminho de código que recebe a maior parte do tráfego.</p>
            <p style="margin:0.6em 0;"><strong>Como identificar:</strong></p>
            <ul style="font-size:0.95em; margin:0;">
              <li>APM / observabilidade (NewRelic, Datadog, Application Insights)</li>
              <li>Logs agregados por endpoint</li>
              <li>Pareto: 20% dos endpoints atendem 80% das requisições</li>
            </ul>
            <div style="margin-top:1em; padding:0.7em 1em; background:#eafaf1; border-left:4px solid #00A859; border-radius:0 6px 6px 0;">
              <p style="margin:0; font-size:0.95em;"><em>Ganhar 1% de performance no <strong>hot path</strong> rende mais que 50% nos endpoints frios.</em></p>
            </div>
          </div>

          <svg viewBox="0 0 240 200" style="width:38%; height:auto;" aria-label="Distribuição de tráfego entre endpoints">
            <!-- "treemap" simplificado -->
            <rect x="10" y="10" width="160" height="180" fill="#ED145B" stroke="white" stroke-width="2"/>
            <text x="90" y="95" font-size="14" fill="white" text-anchor="middle" font-weight="700">/products</text>
            <text x="90" y="115" font-size="22" fill="white" text-anchor="middle" font-weight="800">78%</text>

            <rect x="170" y="10" width="60" height="80" fill="#F39C12" stroke="white" stroke-width="2"/>
            <text x="200" y="42" font-size="9" fill="white" text-anchor="middle" font-weight="700">/checkout</text>
            <text x="200" y="60" font-size="14" fill="white" text-anchor="middle" font-weight="800">8%</text>

            <rect x="170" y="90" width="60" height="100" fill="#888" stroke="white" stroke-width="2"/>
            <text x="200" y="135" font-size="8" fill="white" text-anchor="middle">38 outros</text>
            <text x="200" y="152" font-size="14" fill="white" text-anchor="middle" font-weight="800">14%</text>
          </svg>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">13</div></div>
      </section>
```

- [ ] **Step 2: Validar**

Slide deve mostrar treemap com bloco rosa enorme (78%) à esquerda + 2 blocos menores à direita.

- [ ] **Step 3: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slide 13 - Hot Path com SVG treemap (Pareto)"
```

---

## Task 20: Slide 14 — k6 + Instalação (3 colunas)

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

> Screenshots reais virão na Task 25. Aqui criamos a estrutura com fallbacks.

- [ ] **Step 1: Inserir slide 14**

```html
      <!-- ==================== 14. K6 + INSTALAÇÃO ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>k6 — instalação passo a passo</h2></div>

        <p style="font-size:0.78em; margin:0 0 0.5em;">
          k6 é a ferramenta open-source da Grafana Labs para testes de performance. Roda como binário nativo (Go) — não precisa de Node nem JVM. Testes são escritos em JavaScript.
        </p>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; margin-top:0.5em;">

          <div style="border:2px solid #1E1E2C; border-radius:10px; padding:10px; background:white;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-label="Windows">
                <rect x="2" y="3" width="9" height="9" fill="#0078D4"/>
                <rect x="13" y="3" width="9" height="9" fill="#0078D4"/>
                <rect x="2" y="13" width="9" height="9" fill="#0078D4"/>
                <rect x="13" y="13" width="9" height="9" fill="#0078D4"/>
              </svg>
              <h3 style="margin:0; font-size:0.85em; color:#0078D4;">Windows</h3>
            </div>
            <pre style="font-size:0.55em; background:#1E1E2C; color:#E0E0E0; padding:6px 8px; border-radius:4px; margin:0; overflow:hidden;"><code>winget install k6 --source winget</code></pre>
            <p style="font-size:0.6em; margin:6px 0 0; color:#666;">Alternativa: <code>choco install k6</code></p>
            <img src="../assets/img/k6-install-windows.png" alt="winget install k6 output"
                 style="width:100%; margin-top:6px; border-radius:4px;"
                 onerror="this.style.display='none'">
          </div>

          <div style="border:2px solid #1E1E2C; border-radius:10px; padding:10px; background:white;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-label="macOS">
                <path d="M17.5 12.5c0-2 1-3.5 2-4.5-1-1.5-2.5-2-4-2-2 0-3 1-4 1s-2-1-4-1c-3 0-5 2-5 5.5 0 4 3 8.5 5 8.5 1 0 1.5-1 3.5-1s2.5 1 3.5 1c2 0 4-3.5 4-3.5-2.5-1-3-3-3-4z" fill="#1E1E2C"/>
                <path d="M14 4c0 1.5-1 2.5-2 2.5-.1-1.5 1-2.5 2-2.5z" fill="#1E1E2C"/>
              </svg>
              <h3 style="margin:0; font-size:0.85em; color:#1E1E2C;">macOS</h3>
            </div>
            <pre style="font-size:0.6em; background:#1E1E2C; color:#E0E0E0; padding:6px 8px; border-radius:4px; margin:0;"><code>brew install k6</code></pre>
            <p style="font-size:0.6em; margin:6px 0 0; color:#666;">Requer Homebrew (<code>brew.sh</code>)</p>
            <img src="../assets/img/k6-install-macos.png" alt="brew install k6 output"
                 style="width:100%; margin-top:6px; border-radius:4px;"
                 onerror="this.style.display='none'">
          </div>

          <div style="border:2px solid #1E1E2C; border-radius:10px; padding:10px; background:white;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-label="Linux">
                <circle cx="12" cy="12" r="10" fill="#F39C12"/>
                <ellipse cx="9" cy="10" rx="1.5" ry="2" fill="white"/>
                <ellipse cx="15" cy="10" rx="1.5" ry="2" fill="white"/>
                <circle cx="9" cy="10.5" r="0.8" fill="#1E1E2C"/>
                <circle cx="15" cy="10.5" r="0.8" fill="#1E1E2C"/>
              </svg>
              <h3 style="margin:0; font-size:0.85em; color:#F39C12;">Linux (Debian/Ubuntu)</h3>
            </div>
            <pre style="font-size:0.5em; background:#1E1E2C; color:#E0E0E0; padding:6px 8px; border-radius:4px; margin:0; line-height:1.3;"><code>sudo gpg --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A...
echo "deb [signed-by=...] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update && sudo apt install k6</code></pre>
            <img src="../assets/img/k6-install-linux.png" alt="apt install k6 output"
                 style="width:100%; margin-top:6px; border-radius:4px;"
                 onerror="this.style.display='none'">
          </div>

        </div>

        <div style="margin-top:0.6em; padding:0.6em 0.9em; background:#eafaf1; border-left:4px solid #00A859; border-radius:0 6px 6px 0; display:flex; align-items:center; gap:14px;">
          <strong style="color:#1E8449; font-size:0.78em;">Validação:</strong>
          <pre style="margin:0; font-size:0.65em; background:#1E1E2C; color:#E0E0E0; padding:4px 10px; border-radius:4px;"><code>k6 version</code></pre>
          <span style="font-size:0.7em; color:#1E8449;">→ deve imprimir <code>k6 v0.x.x</code></span>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">14</div></div>
      </section>
```

- [ ] **Step 2: Validar visual**

Slide deve mostrar 3 colunas com ícones do SO + comandos em terminal escuro. Imagens de instalação não aparecem ainda (`onerror` esconde).

- [ ] **Step 3: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slide 14 - instalação k6 (3 colunas Windows/macOS/Linux + validação)"
```

---

## Task 21: Slides 15–16 — Quizzes 1 e 2 (tipos, percentis)

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

- [ ] **Step 1: Inserir slide 15 — Quiz 1 (Tipos de teste)**

```html
      <!-- ==================== 15. QUIZ 1 — TIPOS DE TESTE ==================== -->
      <section class="quiz-slide content-slide"
               data-correct="b"
               data-quiz-id="q1-tipos"
               data-quiz-feedback="Spike test simula picos abruptos. Stress test mediria limites máximos sustentados; soak mede estabilidade ao longo de horas.">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Quiz 1 — Tipos de teste</h2></div>

        <p style="font-size:0.85em;">Sua plataforma de e-commerce vai lançar um <strong>flash sale com 50% de desconto às 20h00 em ponto</strong>. Você quer validar se o sistema aguenta o pico súbito de tráfego que se forma no minuto do lançamento. Qual teste aplicar?</p>

        <ul class="quiz-options">
          <label><input type="radio" name="q1" value="a"> Soak test</label>
          <label><input type="radio" name="q1" value="b"> Spike test</label>
          <label><input type="radio" name="q1" value="c"> Smoke test</label>
          <label><input type="radio" name="q1" value="d"> Stress test</label>
        </ul>

        <div class="quiz-feedback"></div>
        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">15</div></div>
      </section>
```

- [ ] **Step 2: Inserir slide 16 — Quiz 2 (Percentis)**

```html
      <!-- ==================== 16. QUIZ 2 — PERCENTIS ==================== -->
      <section class="quiz-slide content-slide"
               data-correct="b"
               data-quiz-id="q2-percentis"
               data-quiz-feedback="P95=820ms = '95% terminam em até 820ms'. P99 conta a cauda — 1 em 100 sente >4s, e isso é o usuário que reclama.">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Quiz 2 — Latência e percentis</h2></div>

        <p style="font-size:0.85em;">Seu k6 reporta:</p>
        <pre style="font-size:0.7em; background:#1E1E2C; color:#E0E0E0; padding:8px 14px; border-radius:6px;"><code>http_req_duration  p(95)=820ms  p(99)=4200ms</code></pre>
        <p style="font-size:0.85em;">O que isso significa para o usuário?</p>

        <ul class="quiz-options">
          <label><input type="radio" name="q2" value="a"> A média das requisições leva 820ms</label>
          <label><input type="radio" name="q2" value="b"> 5% das requisições passam de 820ms; 1% passa de 4,2s</label>
          <label><input type="radio" name="q2" value="c"> 95% das requisições levam 820ms</label>
          <label><input type="radio" name="q2" value="d"> O sistema tem 4,2s de latência fixa</label>
        </ul>

        <div class="quiz-feedback"></div>
        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">16</div></div>
      </section>
```

- [ ] **Step 3: Validar quiz responde a clique**

Recarregar página. Ir ao slide 15, clicar em cada opção:
- Clicar em "Soak test" → fica vermelho riscado, "Spike test" fica verde, feedback aparece em vermelho com texto "Incorreto. Spike test simula picos…"
- Voltar ao slide 14 e voltar pro 15: opções resetam.
- Clicar direto em "Spike test" → fica verde, feedback verde "Correto! Spike test simula…"

Mesmo para slide 16 com "5% das requisições passam de 820ms…".

- [ ] **Step 4: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slides 15-16 - quizzes 1 (tipos) e 2 (percentis) com markup canônico"
```

---

## Task 22: Slides 19–20 — Apresentação do laboratório + anatomia do script k6

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

> Estes slides ficam **entre** o "Section Bloco 2" (slide 18) já existente e os de iteração que virão.

- [ ] **Step 1: Inserir slide 19 — Apresentação do repo**

Inserir logo após o slide 18 (section Bloco 2):

```html
      <!-- ==================== 19. LABORATÓRIO fiap-2026-1-perf ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Laboratório — <code>fiap-2026-1-perf</code></h2></div>

        <div style="display:flex; gap:25px; align-items:flex-start;">
          <div style="flex:1; font-size:0.8em;">
            <p style="margin:0 0 0.5em;"><strong>Stack:</strong> Node 20 + Express + Sequelize + SQLite</p>
            <p style="margin:0 0 0.5em;"><strong>Cenário:</strong> e-commerce simplificado com 3 endpoints e 3 gargalos plantados de propósito.</p>
            <p style="margin:0.6em 0 0.3em;"><strong>Setup em 3 comandos:</strong></p>
            <pre style="font-size:0.7em; background:#1E1E2C; color:#E0E0E0; padding:8px 12px; border-radius:6px; line-height:1.4;"><code>git clone https://github.com/josercf/fiap-2026-1-perf.git
cd fiap-2026-1-perf
npm install &amp;&amp; npm start</code></pre>
            <p style="margin:0.6em 0 0; font-size:0.75em; color:#666;">Primeira execução: seed automático de 1.000 usuários, 200 produtos, 5.000 pedidos (~30s).</p>
          </div>
          <div style="flex:0.9; font-size:0.7em; font-family:'JetBrains Mono', monospace; background:#FAFAFA; padding:12px; border-radius:8px; border:1px solid #E0E0E0; line-height:1.5;">
            <strong style="color:#ED145B;">fiap-2026-1-perf/</strong><br>
            ├── src/<br>
            │ &nbsp; ├── server.js<br>
            │ &nbsp; ├── routes/ &nbsp;<span style="color:#888;">// 4 endpoints</span><br>
            │ &nbsp; └── db/ &nbsp; &nbsp; &nbsp; <span style="color:#888;">// Sequelize + seed</span><br>
            ├── k6/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<span style="color:#888;">// 4 scripts</span><br>
            ├── tests/ &nbsp; &nbsp; &nbsp; <span style="color:#888;">// node:test</span><br>
            └── docs/ &nbsp; &nbsp; &nbsp; &nbsp;<span style="color:#888;">// gabaritos</span>
          </div>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">19</div></div>
      </section>
```

- [ ] **Step 2: Inserir slide 20 — Anatomia de um script k6**

```html
      <!-- ==================== 20. ANATOMIA DE UM SCRIPT K6 ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Anatomia de um script k6</h2></div>

        <pre style="font-size:0.62em; background:#1E1E2C; color:#E0E0E0; padding:14px 18px; border-radius:8px; line-height:1.55;"><code><span style="color:#888;">// k6/baseline.js</span>
<span style="color:#F39C12;">import</span> http <span style="color:#F39C12;">from</span> <span style="color:#00A859;">'k6/http'</span>;
<span style="color:#F39C12;">import</span> { check, sleep } <span style="color:#F39C12;">from</span> <span style="color:#00A859;">'k6'</span>;

<span style="color:#888;">// 1) Configuração — ramp-up + steady + ramp-down</span>
<span style="color:#F39C12;">export const</span> options = {
  stages: [
    { duration: <span style="color:#00A859;">'30s'</span>, target: <span style="color:#ED145B;">10</span> },  <span style="color:#888;">// ramp-up</span>
    { duration: <span style="color:#00A859;">'1m'</span>,  target: <span style="color:#ED145B;">10</span> },  <span style="color:#888;">// steady</span>
    { duration: <span style="color:#00A859;">'30s'</span>, target: <span style="color:#ED145B;">0</span>  },  <span style="color:#888;">// ramp-down</span>
  ],
  <span style="color:#888;">// 2) Thresholds — gates pass/fail do teste</span>
  thresholds: {
    http_req_failed:   [<span style="color:#00A859;">'rate&lt;0.01'</span>],
    http_req_duration: [<span style="color:#00A859;">'p(95)&lt;200'</span>],
  },
};

<span style="color:#888;">// 3) Função padrão — executada a cada iteração de cada VU</span>
<span style="color:#F39C12;">export default function</span> () {
  <span style="color:#F39C12;">const</span> res = http.get(<span style="color:#00A859;">'http://localhost:3000/health'</span>);
  <span style="color:#888;">// 4) Checks — assertions soft (não param o teste, contam taxa de sucesso)</span>
  check(res, { <span style="color:#00A859;">'status 200'</span>: (r) =&gt; r.status === <span style="color:#ED145B;">200</span> });
  sleep(<span style="color:#ED145B;">1</span>);  <span style="color:#888;">// 5) sleep — espaça requisições, simula usuário real</span>
}</code></pre>

        <div style="margin-top:0.6em; padding:0.6em 0.9em; background:#fdedec; border-left:4px solid #ED145B; border-radius:0 6px 6px 0;">
          <p style="margin:0; font-size:0.8em;"><em><strong>stages</strong> = ramp-up + steady + ramp-down configurável. Cada VU executa <strong>default function</strong> em loop até o teste acabar.</em></p>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">20</div></div>
      </section>
```

- [ ] **Step 3: Validar visual dos slides 19–20**

Slide 19: 2 colunas (texto à esquerda, árvore de pastas à direita). Slide 20: bloco de código com syntax highlighting manual via spans.

- [ ] **Step 4: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slides 19-20 - laboratório fiap-2026-1-perf + anatomia de script k6"
```

---

## Task 23: Slide 21 — Iteração 1 (Sync I/O) com 4 sub-slides verticais

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

> No Reveal.js, slides verticais agrupam-se aninhando `<section>` dentro de outro `<section>`. A navegação fica: ↓ entre sub-slides, → para o próximo grupo.

- [ ] **Step 1: Inserir slide 21 (grupo) com 4 sub-slides**

```html
      <!-- ==================== 21. ITERAÇÃO 1 — SYNC I/O ==================== -->
      <section>

        <!-- 21a. Cenário -->
        <section class="content-slide">
          <div class="top-bar"></div>
          <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
          <div class="slide-title-area"><div class="accent-bar"></div><h2>Iteração 1 — Cenário</h2></div>
          <p style="font-size:0.85em;">Endpoint <code>GET /users/:id/profile</code> retorna o perfil + um <em>integrity hash</em> assinado.</p>
          <pre style="font-size:0.66em; background:#1E1E2C; color:#E0E0E0; padding:10px 14px; border-radius:6px; line-height:1.5;"><code><span style="color:#888;">// src/routes/users.js (trecho)</span>
<span style="color:#F39C12;">const</span> user = <span style="color:#F39C12;">await</span> User.findByPk(req.params.id);
<span style="color:#F39C12;">if</span> (!user) <span style="color:#F39C12;">return</span> res.status(<span style="color:#ED145B;">404</span>).json(...);

<span style="color:#F39C12;">const</span> integrity = crypto
  .pbkdf2Sync(payload, <span style="color:#00A859;">'fiap-salt'</span>, <span style="color:#ED145B;">100_000</span>, <span style="color:#ED145B;">32</span>, <span style="color:#00A859;">'sha512'</span>)
  .toString(<span style="color:#00A859;">'hex'</span>);

res.json({ ...user.toJSON(), integrity });</code></pre>
          <p style="margin-top:0.7em; font-size:0.85em; padding:0.6em 0.9em; background:#fdedec; border-left:4px solid #ED145B; border-radius:0 6px 6px 0;"><strong>Pergunta:</strong> Antes de medir — qual a sua hipótese sobre o que esse endpoint vai mostrar sob carga?</p>
          <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">21</div></div>
        </section>

        <!-- 21b. Baseline -->
        <section class="content-slide">
          <div class="top-bar"></div>
          <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
          <div class="slide-title-area"><div class="accent-bar"></div><h2>Iteração 1 — Baseline</h2></div>
          <p style="font-size:0.85em;">Rodar o teste focado:</p>
          <pre style="font-size:0.7em; background:#1E1E2C; color:#E0E0E0; padding:8px 14px; border-radius:6px;"><code>k6 run k6/sync-io.js</code></pre>
          <img src="../assets/img/aula11-iteracao1-baseline.png"
               alt="Output do k6 baseline iteração 1"
               style="width:80%; margin-top:0.6em; border-radius:8px; border:1px solid #ddd;"
               onerror="this.outerHTML='&lt;div style=&quot;background:#1E1E2C;color:#E0E0E0;font-family:monospace;font-size:0.62em;padding:12px;border-radius:8px;line-height:1.5;width:80%;&quot;&gt;     http_req_duration..............: avg=1.2s min=85ms med=120ms<br>       { expected_response:true }: &lt;strong style=&quot;color:#F39C12&quot;&gt;p(95)=3.4s p(99)=8.1s&lt;/strong&gt;<br>     http_req_failed................: 0.00%   ✓ 0 ✗ 1124<br>     &lt;strong style=&quot;color:#ED145B&quot;&gt;http_reqs......................: 1124 9.3/s&lt;/strong&gt;<br>     vus............................: 50&lt;/div&gt;'">
          <p style="margin-top:0.6em; font-size:0.78em;">📌 <strong>Anote:</strong> P50 ≈ 120ms · P95 ≈ 3,4s · P99 ≈ 8s · throughput ≈ 9 RPS (com 50 VUs!).</p>
          <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">21</div></div>
        </section>

        <!-- 21c. Diagnóstico -->
        <section class="content-slide">
          <div class="top-bar"></div>
          <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
          <div class="slide-title-area"><div class="accent-bar"></div><h2>Iteração 1 — Diagnóstico</h2></div>
          <div style="display:flex; gap:20px; align-items:center;">
            <svg viewBox="0 0 320 200" style="width:55%;" aria-label="Curvas P50, P99 e throughput sob carga">
              <line x1="30" y1="170" x2="310" y2="170" stroke="#1E1E2C"/>
              <line x1="30" y1="170" x2="30" y2="20" stroke="#1E1E2C"/>
              <text x="170" y="188" font-size="9" fill="#1E1E2C" text-anchor="middle">VUs →</text>
              <!-- P50 plana -->
              <polyline points="30,140 100,138 170,140 240,142 300,140" fill="none" stroke="#00A859" stroke-width="2.5"/>
              <text x="305" y="138" font-size="9" fill="#00A859" font-weight="700">P50</text>
              <!-- P99 explode -->
              <polyline points="30,150 100,120 170,80 240,40 300,25" fill="none" stroke="#C0392B" stroke-width="2.5"/>
              <text x="305" y="22" font-size="9" fill="#C0392B" font-weight="700">P99</text>
              <!-- throughput plateau -->
              <polyline points="30,160 80,130 130,115 180,112 230,112 280,112" fill="none" stroke="#ED145B" stroke-width="2.5" stroke-dasharray="4"/>
              <text x="285" y="108" font-size="9" fill="#ED145B" font-weight="700">RPS</text>
            </svg>
            <div style="flex:1; font-size:0.78em;">
              <p style="margin:0 0 0.5em;"><strong style="color:#00A859;">P50 estável</strong>: a maioria das requisições continua rápida.</p>
              <p style="margin:0 0 0.5em;"><strong style="color:#C0392B;">P99 explode</strong>: a cauda sente requisições enfileiradas atrás de outra bloqueando.</p>
              <p style="margin:0 0 0.7em;"><strong style="color:#ED145B;">Throughput plateau</strong>: adicionar mais VUs <em>não</em> aumenta RPS.</p>
              <p style="margin:0; padding:0.5em 0.8em; background:#fdedec; border-left:4px solid #C0392B; border-radius:0 6px 6px 0;"><strong>Diagnóstico:</strong> assinatura clássica de <em>event loop bloqueado</em> por operação síncrona.</p>
            </div>
          </div>
          <p style="margin-top:0.6em; font-size:0.78em;">→ Suspeito: <code>crypto.pbkdf2Sync</code> com 100k iterações (~120ms por chamada).</p>
          <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">21</div></div>
        </section>

        <!-- 21d. Fix + remedição -->
        <section class="content-slide">
          <div class="top-bar"></div>
          <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
          <div class="slide-title-area"><div class="accent-bar"></div><h2>Iteração 1 — Fix &amp; Remedição</h2></div>
          <div style="display:flex; gap:18px; align-items:flex-start;">
            <pre style="flex:1.4; font-size:0.6em; background:#1E1E2C; color:#E0E0E0; padding:10px 12px; border-radius:6px; line-height:1.5; margin:0;"><code><span style="color:#C0392B;">- crypto.pbkdf2Sync(payload, salt, 100_000, 32, 'sha512')</span>
<span style="color:#00A859;">+ import { promisify } from 'node:util';</span>
<span style="color:#00A859;">+ const pbkdf2 = promisify(crypto.pbkdf2);</span>
<span style="color:#00A859;">+ await pbkdf2(payload, salt, 100_000, 32, 'sha512')</span></code></pre>
            <svg viewBox="0 0 240 160" style="flex:1; max-width:35%;" aria-label="Comparativo antes/depois">
              <line x1="20" y1="140" x2="230" y2="140" stroke="#1E1E2C"/>
              <line x1="20" y1="140" x2="20" y2="20" stroke="#1E1E2C"/>
              <!-- Antes: barras altas -->
              <rect x="35" y="55" width="22" height="85" fill="#C0392B"/>
              <text x="46" y="50" font-size="8" text-anchor="middle" fill="#1E1E2C">3,4s</text>
              <text x="46" y="155" font-size="8" text-anchor="middle" fill="#666">P95 antes</text>
              <rect x="65" y="30" width="22" height="110" fill="#C0392B" opacity="0.85"/>
              <text x="76" y="25" font-size="8" text-anchor="middle" fill="#1E1E2C">8s</text>
              <text x="76" y="155" font-size="8" text-anchor="middle" fill="#666">P99 antes</text>
              <!-- Depois: barras curtas verdes -->
              <rect x="135" y="125" width="22" height="15" fill="#00A859"/>
              <text x="146" y="120" font-size="8" text-anchor="middle" fill="#1E1E2C">220ms</text>
              <text x="146" y="155" font-size="8" text-anchor="middle" fill="#666">P95 fix</text>
              <rect x="165" y="118" width="22" height="22" fill="#00A859" opacity="0.85"/>
              <text x="176" y="113" font-size="8" text-anchor="middle" fill="#1E1E2C">450ms</text>
              <text x="176" y="155" font-size="8" text-anchor="middle" fill="#666">P99 fix</text>
              <text x="120" y="15" font-size="9" fill="#1E1E2C" text-anchor="middle" font-weight="700">~15× P99</text>
            </svg>
          </div>
          <img src="../assets/img/aula11-iteracao1-fix.png" alt="Output do k6 após fix"
               style="width:65%; margin-top:0.5em; border-radius:6px; border:1px solid #ddd;"
               onerror="this.style.display='none'">
          <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">21</div></div>
        </section>

      </section>
```

- [ ] **Step 2: Validar navegação vertical**

No navegador:
- Setas ↓/↑ alternam entre 21a → 21b → 21c → 21d.
- Setas →/← saltam para slide 20 (anterior) ou 22 (próximo grupo).
- SVGs renderizam corretamente.

- [ ] **Step 3: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slide 21 - iteração 1 (sync I/O) com 4 sub-slides verticais"
```

---

## Task 24: Slide 22 — Iteração 2 (N+1) com 4 sub-slides verticais

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

- [ ] **Step 1: Inserir slide 22 (grupo) após slide 21**

```html
      <!-- ==================== 22. ITERAÇÃO 2 — N+1 ==================== -->
      <section>

        <!-- 22a. Cenário -->
        <section class="content-slide">
          <div class="top-bar"></div>
          <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
          <div class="slide-title-area"><div class="accent-bar"></div><h2>Iteração 2 — Cenário</h2></div>
          <p style="font-size:0.85em;">Endpoint <code>GET /orders</code> retorna pedidos com seus itens aninhados. Funciona bem em dev (10 pedidos)... mas em produção (5.000 pedidos) <em>algo não bate</em>.</p>
          <pre style="font-size:0.66em; background:#1E1E2C; color:#E0E0E0; padding:10px 14px; border-radius:6px; line-height:1.5;"><code><span style="color:#888;">// src/routes/orders.js (trecho)</span>
<span style="color:#F39C12;">const</span> orders = <span style="color:#F39C12;">await</span> Order.findAll({ limit: <span style="color:#ED145B;">50</span> });

<span style="color:#F39C12;">const</span> result = [];
<span style="color:#F39C12;">for</span> (<span style="color:#F39C12;">const</span> order <span style="color:#F39C12;">of</span> orders) {
  <span style="color:#F39C12;">const</span> items = <span style="color:#F39C12;">await</span> OrderItem.findAll({
    where: { orderId: order.id }
  });
  result.push({ ...order.toJSON(), items });
}
res.json(result);</code></pre>
          <p style="margin-top:0.7em; font-size:0.85em; padding:0.6em 0.9em; background:#fdedec; border-left:4px solid #ED145B; border-radius:0 6px 6px 0;"><strong>Pergunta:</strong> Quantas queries esse endpoint dispara para retornar 50 pedidos?</p>
          <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">22</div></div>
        </section>

        <!-- 22b. Baseline -->
        <section class="content-slide">
          <div class="top-bar"></div>
          <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
          <div class="slide-title-area"><div class="accent-bar"></div><h2>Iteração 2 — Baseline</h2></div>
          <pre style="font-size:0.7em; background:#1E1E2C; color:#E0E0E0; padding:8px 14px; border-radius:6px;"><code>k6 run k6/n-plus-one.js</code></pre>
          <img src="../assets/img/aula11-iteracao2-baseline.png"
               alt="Output do k6 baseline iteração 2"
               style="width:80%; margin-top:0.6em; border-radius:8px; border:1px solid #ddd;"
               onerror="this.outerHTML='&lt;div style=&quot;background:#1E1E2C;color:#E0E0E0;font-family:monospace;font-size:0.62em;padding:12px;border-radius:8px;line-height:1.5;width:80%;&quot;&gt;     http_req_duration..............: avg=1.6s med=1.5s<br>       { expected_response:true }: &lt;strong style=&quot;color:#F39C12&quot;&gt;p(95)=2.8s p(99)=4.2s&lt;/strong&gt;<br>     http_req_failed................: 0.30%<br>     &lt;strong style=&quot;color:#ED145B&quot;&gt;http_reqs......................: 1342 11/s&lt;/strong&gt;<br>     vus............................: 30&lt;/div&gt;'">
          <p style="margin-top:0.6em; font-size:0.78em;">📌 Throughput baixo (~11 RPS com 30 VUs), latência média alta. Habilitando log do Sequelize: <strong>51 SELECTs por requisição</strong>.</p>
          <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">22</div></div>
        </section>

        <!-- 22c. Diagnóstico -->
        <section class="content-slide">
          <div class="top-bar"></div>
          <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
          <div class="slide-title-area"><div class="accent-bar"></div><h2>Iteração 2 — Diagnóstico</h2></div>
          <div style="display:flex; gap:20px; align-items:center;">
            <svg viewBox="0 0 280 200" style="width:50%;" aria-label="Diagrama N+1: 1 query mãe + N queries filhas">
              <!-- query mãe -->
              <rect x="20" y="20" width="240" height="28" fill="#ED145B" stroke="white" stroke-width="2"/>
              <text x="140" y="38" font-size="11" fill="white" text-anchor="middle" font-weight="700">1 × SELECT FROM orders</text>
              <!-- 50 queries filhas (representadas como 6 + "..." para caber) -->
              <g>
                <rect x="20" y="60" width="35" height="20" fill="#F39C12" stroke="white" stroke-width="1.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0s"/></rect>
                <rect x="58" y="60" width="35" height="20" fill="#F39C12" stroke="white" stroke-width="1.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.1s"/></rect>
                <rect x="96" y="60" width="35" height="20" fill="#F39C12" stroke="white" stroke-width="1.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.2s"/></rect>
                <rect x="134" y="60" width="35" height="20" fill="#F39C12" stroke="white" stroke-width="1.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.3s"/></rect>
                <rect x="172" y="60" width="35" height="20" fill="#F39C12" stroke="white" stroke-width="1.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.4s"/></rect>
                <text x="225" y="74" font-size="14" fill="#F39C12" font-weight="700">…×50</text>
              </g>
              <text x="140" y="100" font-size="11" fill="#1E1E2C" text-anchor="middle">SELECT FROM order_items WHERE orderId = ?</text>
              <!-- total -->
              <rect x="60" y="125" width="160" height="40" fill="#C0392B"/>
              <text x="140" y="143" font-size="11" fill="white" text-anchor="middle" font-weight="700">Total</text>
              <text x="140" y="158" font-size="14" fill="white" text-anchor="middle" font-weight="800">51 queries</text>
              <text x="140" y="185" font-size="9" fill="#666" text-anchor="middle">por requisição</text>
            </svg>
            <div style="flex:1; font-size:0.78em;">
              <p style="margin:0 0 0.4em;"><strong>1 query mãe:</strong> busca os 50 pedidos.</p>
              <p style="margin:0 0 0.4em;"><strong>N queries filhas:</strong> uma por pedido, buscando seus itens.</p>
              <p style="margin:0 0 0.6em;">Cada query custa ~25ms de round-trip + parsing. <strong>50 × 25ms = 1,25s</strong> só de overhead — antes mesmo de processar dados.</p>
              <p style="margin:0; padding:0.5em 0.8em; background:#fdedec; border-left:4px solid #C0392B; border-radius:0 6px 6px 0;">Conhecido como <strong>N+1</strong>. Pitfall clássico de qualquer ORM.</p>
            </div>
          </div>
          <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">22</div></div>
        </section>

        <!-- 22d. Fix + remedição -->
        <section class="content-slide">
          <div class="top-bar"></div>
          <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
          <div class="slide-title-area"><div class="accent-bar"></div><h2>Iteração 2 — Fix &amp; Remedição</h2></div>
          <div style="display:flex; gap:18px; align-items:flex-start;">
            <pre style="flex:1.4; font-size:0.6em; background:#1E1E2C; color:#E0E0E0; padding:10px 12px; border-radius:6px; line-height:1.5; margin:0;"><code><span style="color:#C0392B;">- const orders = await Order.findAll({ limit: 50 });</span>
<span style="color:#C0392B;">- for (const order of orders) {</span>
<span style="color:#C0392B;">-   const items = await OrderItem.findAll({</span>
<span style="color:#C0392B;">-     where: { orderId: order.id }</span>
<span style="color:#C0392B;">-   });</span>
<span style="color:#C0392B;">-   result.push({ ...order.toJSON(), items });</span>
<span style="color:#C0392B;">- }</span>
<span style="color:#00A859;">+ const orders = await Order.findAll({</span>
<span style="color:#00A859;">+   limit: 50,</span>
<span style="color:#00A859;">+   include: [{ model: OrderItem, as: 'items' }]</span>
<span style="color:#00A859;">+ });</span></code></pre>
            <svg viewBox="0 0 240 160" style="flex:1; max-width:35%;" aria-label="Comparativo antes/depois N+1">
              <line x1="20" y1="140" x2="230" y2="140" stroke="#1E1E2C"/>
              <line x1="20" y1="140" x2="20" y2="20" stroke="#1E1E2C"/>
              <!-- Antes -->
              <rect x="35" y="55" width="22" height="85" fill="#C0392B"/>
              <text x="46" y="50" font-size="8" text-anchor="middle">2,8s</text>
              <text x="46" y="155" font-size="8" text-anchor="middle" fill="#666">P95</text>
              <rect x="68" y="105" width="22" height="35" fill="#C0392B" opacity="0.6"/>
              <text x="79" y="100" font-size="8" text-anchor="middle">11/s</text>
              <text x="79" y="155" font-size="8" text-anchor="middle" fill="#666">RPS</text>
              <!-- Depois -->
              <rect x="135" y="130" width="22" height="10" fill="#00A859"/>
              <text x="146" y="125" font-size="8" text-anchor="middle">90ms</text>
              <text x="146" y="155" font-size="8" text-anchor="middle" fill="#666">P95</text>
              <rect x="168" y="35" width="22" height="105" fill="#00A859" opacity="0.85"/>
              <text x="179" y="30" font-size="8" text-anchor="middle">220/s</text>
              <text x="179" y="155" font-size="8" text-anchor="middle" fill="#666">RPS</text>
              <text x="120" y="15" font-size="9" text-anchor="middle" font-weight="700">20× RPS · 30× P95</text>
            </svg>
          </div>
          <img src="../assets/img/aula11-iteracao2-fix.png" alt="Output do k6 após fix N+1"
               style="width:65%; margin-top:0.5em; border-radius:6px; border:1px solid #ddd;"
               onerror="this.style.display='none'">
          <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">22</div></div>
        </section>

      </section>
```

- [ ] **Step 2: Validar navegação vertical**

Setas ↓ entre 22a → 22b → 22c → 22d. Animações pulsando nas queries N (22c).

- [ ] **Step 3: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slide 22 - iteração 2 (N+1) com 4 sub-slides verticais"
```

---

## Task 25: Slides 23–28 — Quizzes 3-4, desafio, considerações finais

**Files:**
- Modify: `aulas-2sem/aulas/aula11.html`

- [ ] **Step 1: Inserir slide 23 — Quiz 3 (Interpretação aplicada)**

```html
      <!-- ==================== 23. QUIZ 3 — INTERPRETAÇÃO APLICADA ==================== -->
      <section class="quiz-slide content-slide"
               data-correct="b"
               data-quiz-id="q3-interpretacao"
               data-quiz-feedback="Throughput plateau + P99 explodindo enquanto P50 mantém é assinatura clássica de saturação por bloqueio. Mais VUs ficam enfileirados, não atendidos.">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Quiz 3 — Interpretação aplicada</h2></div>
        <p style="font-size:0.82em;">Você roda um teste com ramp-up de 0→200 VUs. O output mostra:</p>
        <pre style="font-size:0.7em; background:#1E1E2C; color:#E0E0E0; padding:8px 14px; border-radius:6px;"><code>http_reqs         80/s   (estagnado, mesmo aumentando VUs)
http_req_duration p(50)=300ms  p(99)=12s</code></pre>
        <p style="font-size:0.82em;">Qual o sintoma mais provável?</p>
        <ul class="quiz-options">
          <label><input type="radio" name="q3" value="a"> Falta de cache</label>
          <label><input type="radio" name="q3" value="b"> Recurso bloqueante (event loop, lock, sync I/O) saturado</label>
          <label><input type="radio" name="q3" value="c"> Banco de dados sem índice</label>
          <label><input type="radio" name="q3" value="d"> Rede congestionada</label>
        </ul>
        <div class="quiz-feedback"></div>
        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">23</div></div>
      </section>
```

- [ ] **Step 2: Inserir slide 24 — Quiz 4 (Hot Path)**

```html
      <!-- ==================== 24. QUIZ 4 — HOT PATH ==================== -->
      <section class="quiz-slide content-slide"
               data-correct="b"
               data-quiz-id="q4-hotpath"
               data-quiz-feedback="Hot path = onde a maioria do tráfego passa. Otimizar 1% nele rende mais que 50% nos outros 38 juntos. Pareto aplicado a performance.">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Quiz 4 — Hot Path</h2></div>
        <p style="font-size:0.82em;">Sua app tem 40 endpoints. Logs do APM mostram que <code>GET /products</code> recebe <strong>78%</strong> das requisições, <code>POST /checkout</code> recebe 8%, e os outros 38 dividem 14%. Você tem <strong>1 dia</strong> para testes de carga antes do Black Friday. Por onde começar?</p>
        <ul class="quiz-options">
          <label><input type="radio" name="q4" value="a"> Rodar k6 contra todos os 40 endpoints igualmente</label>
          <label><input type="radio" name="q4" value="b"> <code>GET /products</code> (hot path — 78% do tráfego)</label>
          <label><input type="radio" name="q4" value="c"> <code>POST /checkout</code> (mais crítico para receita)</label>
          <label><input type="radio" name="q4" value="d"> Os 38 endpoints restantes (somam 14% e podem ter bugs)</label>
        </ul>
        <div class="quiz-feedback"></div>
        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">24</div></div>
      </section>
```

- [ ] **Step 3: Inserir slide 25 — Desafio (cache em hot path)**

```html
      <!-- ==================== 25. DESAFIO — CACHE EM HOT PATH ==================== -->
      <section class="content-slide" style="background:linear-gradient(135deg, #fff 0%, #fdedec 100%);">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>🎯 Desafio (casa) — Cache em Hot Path</h2></div>
        <p style="font-size:0.85em;"><code>GET /products</code> é o hot path do app (78% do tráfego). Catálogo muda raramente. <strong>Sem cache</strong>, cada requisição vai ao DB.</p>

        <div style="display:flex; gap:20px; margin-top:0.5em;">
          <div style="flex:1; padding:0.8em 1em; background:white; border:1px solid #ddd; border-radius:8px;">
            <h3 style="margin:0 0 0.4em; font-size:0.85em; color:#ED145B;">Tarefa</h3>
            <ol style="font-size:0.72em; margin:0; padding-left:1.2em;">
              <li>Rodar baseline: <code>k6 run k6/products-cache.js</code> · anotar P50/P95/P99/RPS</li>
              <li>Implementar cache em <code>src/routes/products.js</code> com TTL 60s<br>(<code>node-cache</code> ou <code>Map</code>+<code>Date.now()</code>)</li>
              <li>Re-rodar e capturar antes/depois</li>
            </ol>
          </div>
          <div style="flex:1; padding:0.8em 1em; background:white; border:1px solid #ddd; border-radius:8px;">
            <h3 style="margin:0 0 0.4em; font-size:0.85em; color:#00A859;">Entregável</h3>
            <ul style="font-size:0.72em; margin:0; padding-left:1.2em;">
              <li>Fork do <code>fiap-2026-1-perf</code></li>
              <li>PR com a alteração</li>
              <li>2 screenshots do output do k6 (antes/depois)</li>
              <li>Postar link no Teams da disciplina</li>
            </ul>
          </div>
        </div>

        <div style="margin-top:0.7em; padding:0.6em 0.9em; background:#eafaf1; border-left:4px solid #00A859; border-radius:0 6px 6px 0;">
          <p style="margin:0; font-size:0.78em;"><strong>Dica:</strong> ganho esperado é <em>massivo</em> (P95 ~800ms → ~5ms; RPS ~50 → ~5000). Se ficar 10× só, refletir: o cache está hiteando? TTL adequado?</p>
        </div>

        <p style="margin-top:0.5em; font-size:0.7em; color:#666;">Roteiro completo: <code>fiap-2026-1-perf/docs/desafio-cache.md</code></p>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">25</div></div>
      </section>
```

- [ ] **Step 4: Inserir slide 26 — Considerações finais**

```html
      <!-- ==================== 26. CONSIDERAÇÕES FINAIS ==================== -->
      <section class="content-slide">
        <div class="top-bar"></div>
        <img src="../assets/img/fiap-logo-simple.png" alt="FIAP" class="fiap-logo-header">
        <div class="slide-title-area"><div class="accent-bar"></div><h2>Considerações finais</h2></div>

        <ul style="font-size:0.83em;">
          <li><strong>Forma da curva &gt; valor absoluto.</strong> Mesmo hardware diferente, o padrão de saturação é o que importa.</li>
          <li><strong>P99 antes da média.</strong> A cauda é onde mora a frustração do usuário.</li>
          <li><strong>Identificar hot path antes de otimizar qualquer coisa.</strong> Pareto aplicado a performance.</li>
          <li><strong>k6 no CI/CD.</strong> Thresholds viram <em>gates de PR</em>: <code>p(95)&lt;500ms</code> bloqueia merge se regredir.</li>
          <li><strong>Próximos passos:</strong> k6 Cloud / k6 Operator (k8s) para escala distribuída · profiling do servidor (V8 inspector, flame graphs) · APM (Datadog, NewRelic).</li>
        </ul>

        <div style="margin-top:0.8em; padding:0.7em 1em; background:#1E1E2C; color:white; border-radius:8px; font-size:0.85em;">
          <strong>Frase de fim:</strong> <em>"Você não conhece o seu sistema até medi-lo sob carga. E ele não está pronto para produção até essa medição passar."</em>
        </div>

        <div class="slide-footer"><div class="footer-bar">11 - Testes de Carga</div><div class="footer-page">26</div></div>
      </section>
```

- [ ] **Step 5: Validar slides 23–26**

Quiz 3 e 4 devem responder a clique. Slide 25 com gradiente de fundo. Slide 26 com box escuro de fechamento.

- [ ] **Step 6: Commit**

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "feat(aula11): slides 23-26 - quizzes 3-4, desafio cache, considerações finais"
```

---

## Task 26: Capturar e adicionar screenshots reais

**Files:**
- Create: `aulas-2sem/assets/img/k6-install-windows.png` (ou .jpg)
- Create: `aulas-2sem/assets/img/k6-install-macos.png`
- Create: `aulas-2sem/assets/img/k6-install-linux.png`
- Create: `aulas-2sem/assets/img/k6-version.png`
- Create: `aulas-2sem/assets/img/k6-output-anatomy.png`
- Create: `aulas-2sem/assets/img/aula11-iteracao1-baseline.png`
- Create: `aulas-2sem/assets/img/aula11-iteracao1-fix.png`
- Create: `aulas-2sem/assets/img/aula11-iteracao2-baseline.png`
- Create: `aulas-2sem/assets/img/aula11-iteracao2-fix.png`

> Esta tarefa **requer interação manual** do professor — capturas reais de tela em sua máquina ou da documentação oficial do k6. O agente automatizado não pode capturar screenshots de instalação em máquinas externas. Pode-se baixar imagens de `grafana.com/docs/k6/latest/set-up/install-k6/` se preservar atribuição.

- [ ] **Step 1: Capturar screenshots de instalação do k6 (Windows / macOS / Linux)**

Opções:
- **Capturas locais:** professor abre PowerShell/Terminal/bash em VM ou máquina nativa, roda o comando, captura a janela com a saída.
- **Imagens da doc oficial:** baixar de [grafana.com/docs/k6/latest/set-up/install-k6/](https://grafana.com/docs/k6/latest/set-up/install-k6/) com atribuição na seção de fontes do README/site da aula.

Salvar em `aulas-2sem/assets/img/` com os nomes acima.

- [ ] **Step 2: Capturar screenshot de `k6 version`**

```bash
k6 version > /tmp/k6v.txt
# capturar a janela do terminal mostrando o output, salvar como k6-version.png
```

- [ ] **Step 3: Capturar output do k6 anotado (slide 12)**

Subir `fiap-2026-1-perf` e rodar `k6 run k6/baseline.js`. Capturar a tela final do k6 (resumo com `http_reqs`, `http_req_duration`, etc.). Anotar com setas/destaque em editor de imagem (Preview no Mac, Snip & Sketch no Windows).

- [ ] **Step 4: Capturar outputs das 4 medições das iterações**

Rodar contra `fiap-2026-1-perf`:
- Antes do fix da iteração 1 → `aula11-iteracao1-baseline.png`
- Aplicar fix da iteração 1, rodar, capturar → `aula11-iteracao1-fix.png`
- Reverter fix; antes do fix da iteração 2 → `aula11-iteracao2-baseline.png`
- Aplicar fix da iteração 2 → `aula11-iteracao2-fix.png`

- [ ] **Step 5: Validar que as imagens aparecem nos slides 12, 14, 21, 22**

Recarregar `aula11.html`. Slides com screenshots agora mostram a imagem (não mais o fallback textual em terminal escuro).

- [ ] **Step 6: Commit**

```bash
cd /Users/joseromualdocostafilho/Projects/FIAP/FIAP-2026-1-3SIZ
git add aulas-2sem/assets/img/k6-*.png aulas-2sem/assets/img/aula11-*.png
git commit -m "assets(aula11): screenshots reais de instalação k6 + outputs das iterações"
```

---

## Task 27: Validação visual completa

**Files:** (nenhum criado/editado — só validação)

- [ ] **Step 1: Servir e abrir no Chrome**

```bash
cd /Users/joseromualdocostafilho/Projects/FIAP/FIAP-2026-1-3SIZ/aulas-2sem
python3 -m http.server 8080 &
```

Abrir `http://localhost:8080/aulas/aula11.html`.

- [ ] **Step 2: Navegar slide-a-slide e validar checklist**

Para cada um dos 28 slides:
- [ ] Slide 1 (Capa): logo FIAP centralizado.
- [ ] Slide 2 (Título): "Testes de Carga" com data 05/05/2026.
- [ ] Slide 3 (Agenda): tabela com 3 linhas (Bloco 1 / Intervalo / Bloco 2).
- [ ] Slide 4 (Section Bloco 1): faixa visual.
- [ ] Slide 5 (Por que testar): bullets + callout vermelho.
- [ ] Slide 6 (Tipos): 4 cards lado a lado, curvas SVG distintas.
- [ ] Slide 7 (Ramp-up/down): círculo verde animado percorrendo curva.
- [ ] Slide 8 (Throughput): barra "100 RPS × 60s = 6.000 reqs".
- [ ] Slide 9 (Percentis): histograma com 3 linhas verticais coloridas.
- [ ] Slide 10 (Error rate): tabela com 4 faixas coloridas.
- [ ] Slide 11 (Saturação): caixinha enchendo com gota transbordando.
- [ ] Slide 12 (Output k6): imagem ou fallback textual.
- [ ] Slide 13 (Hot Path): treemap com bloco rosa de 78%.
- [ ] Slide 14 (Instalação k6): 3 colunas com ícones SO + comandos.
- [ ] Slide 15 (Quiz 1): clicável, opção certa fica verde.
- [ ] Slide 16 (Quiz 2): idem.
- [ ] Slide 17 (Intervalo): mensagem de pausa.
- [ ] Slide 18 (Section Bloco 2): faixa visual.
- [ ] Slide 19 (Lab): 2 colunas com árvore de pastas à direita.
- [ ] Slide 20 (Anatomia k6): bloco de código colorido.
- [ ] Slides 21a–d (Iteração 1): navegáveis com ↓.
- [ ] Slides 22a–d (Iteração 2): navegáveis com ↓.
- [ ] Slide 23 (Quiz 3): clicável.
- [ ] Slide 24 (Quiz 4): clicável.
- [ ] Slide 25 (Desafio): gradiente de fundo, 2 colunas.
- [ ] Slide 26 (Considerações finais): box escuro de fechamento.
- [ ] Slide 27 (Dúvidas): "?".
- [ ] Slide 28 (Encerramento): logo + copyright.

- [ ] **Step 3: Verificar console JavaScript**

Abrir DevTools → Console. Não deve haver erros. Avisos de imagens 404 só são aceitáveis em slides cujos screenshots ainda não foram capturados (Task 26 incompleta).

- [ ] **Step 4: Exportar PDF e validar**

Abrir `http://localhost:8080/aulas/aula11.html?print-pdf` no Chrome → `Cmd+P` ou `Ctrl+P` → "Save as PDF" → "Layout: Landscape". Salvar em `/tmp/aula11.pdf`.

Esperado:
- 28 páginas (mais 8 de sub-slides verticais = ~36 páginas total).
- SVGs preservados (estáticos; animações ficam em frame único, ok).
- Fontes carregaram (Montserrat + JetBrains Mono).
- Texto legível em todas as páginas.
- Quizzes mostram opções (sem destacar resposta — natural pois PDF é estático).

- [ ] **Step 5: Parar servidor**

```bash
kill %1
```

- [ ] **Step 6: Commit final (se houve correções)**

Se durante a validação você corrigiu algo (typo, cor, layout):

```bash
git add aulas-2sem/aulas/aula11.html
git commit -m "fix(aula11): ajustes visuais identificados na validação"
```

---

## Self-Review

> Esta seção é checklist do autor do plano (Claude) — registro o resultado aqui antes de entregar.

**1. Spec coverage:**

| Spec section | Tarefa que cobre |
|---|---|
| Decisões aprovadas (stack, gargalos, quizzes) | Tasks 1–11 (repo) + 13–25 (slides) |
| Estrutura de arquivos do repo | Task 1 (scaffold) + Tasks 2–11 |
| Estrutura de slides (28 slides) | Tasks 13–25 |
| 4 quizzes com markup canônico | Tasks 21 (q1, q2), 25 (q3, q4) |
| 10 SVGs inline | Tasks 15, 16, 17, 19, 23, 24 |
| Imagens raster (screenshots) | Task 26 |
| Endpoints com gargalos | Tasks 5 (sync), 6 (N+1), 7 (cache) |
| Scripts k6 | Tasks 8 (baseline), 9 (3 cenários) |
| Gabaritos | Task 10 |
| README | Task 11 |
| Validação | Tasks 12 (repo), 27 (slides) |
| Critérios de aceite | distribuídos em "Validar" steps |
| Riscos (calibração pbkdf2, etc.) | Task 5 step 6 (validação manual + ajuste de iterations) |

✅ Sem gaps.

**2. Placeholder scan:**

Procurei por padrões de "TBD"/"TODO"/"add appropriate"/"similar to" — encontrados:
- Task 13: comentários `<!-- TODO: slides 5–16 nas próximas tasks -->` são marcadores de progresso intencionais, removidos conforme tasks 14–21 inserem conteúdo. Deixados de propósito.
- Nenhum outro placeholder encontrado.

✅ Limpo.

**3. Type consistency:**

- `createApp()` é definido na Task 4 e referenciado em todas as `tests/*.test.js` (Tasks 4, 5, 6, 7) com a mesma assinatura.
- `User`, `Order`, `OrderItem`, `Product` exportados de `src/db/index.js` (Task 2) e usados nas rotas (Tasks 5–7) com nomes consistentes.
- `data-quiz-id` valores: `q1-tipos`, `q2-percentis`, `q3-interpretacao`, `q4-hotpath` — únicos e consistentes com o spec.
- `data-correct="b"` em todos os 4 quizzes — bate com o spec.

✅ Consistente.
