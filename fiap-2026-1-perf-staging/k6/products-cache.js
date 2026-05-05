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
