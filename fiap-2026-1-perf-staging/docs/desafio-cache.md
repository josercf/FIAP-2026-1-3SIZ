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
