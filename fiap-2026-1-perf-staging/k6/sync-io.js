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
