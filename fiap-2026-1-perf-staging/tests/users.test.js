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
