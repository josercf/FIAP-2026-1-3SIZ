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
