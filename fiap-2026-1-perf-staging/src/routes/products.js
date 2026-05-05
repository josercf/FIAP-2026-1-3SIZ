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
