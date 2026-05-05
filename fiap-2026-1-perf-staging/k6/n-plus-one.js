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
