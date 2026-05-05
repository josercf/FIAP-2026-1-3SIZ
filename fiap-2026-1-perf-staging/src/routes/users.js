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
  // CALIBRAÇÃO: ajustar 100_000 para hardware do professor — alvo 80–150ms.
  // Medir: time curl http://localhost:3000/users/1/profile
  const integrity = crypto
    .pbkdf2Sync(payload, 'fiap-salt', 100_000, 32, 'sha512')
    .toString('hex');

  res.json({ ...user.toJSON(), integrity });
});
