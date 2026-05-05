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
