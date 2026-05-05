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
