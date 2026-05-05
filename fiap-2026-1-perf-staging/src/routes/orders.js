// src/routes/orders.js
import { Router } from 'express';
import { Order, OrderItem } from '../db/index.js';

export const ordersRouter = Router();

/**
 * GARGALO PLANTADO #2 — N+1 query.
 *
 * `Order.findAll()` faz 1 query.
 * Para cada order, `OrderItem.findAll({ where: { orderId } })` faz +1 query.
 * Total: 1 + N queries. Em 5000 orders, isso seria 5001 queries.
 *
 * Aqui limitamos com ?limit (default 50) para que seja rodável,
 * mas mesmo com 50 já são 51 queries — visível no k6 e no Sequelize log.
 *
 * Fix esperado: `Order.findAll({ include: [{ model: OrderItem, as: 'items' }] })`
 * → 1 query com JOIN. Ver docs/iteracao-2-n-plus-one.md.
 */
ordersRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? '50', 10), 200);

  const orders = await Order.findAll({ limit, order: [['id', 'ASC']] });

  const result = [];
  for (const order of orders) {
    const items = await OrderItem.findAll({ where: { orderId: order.id } });
    result.push({ ...order.toJSON(), items: items.map((i) => i.toJSON()) });
  }

  res.json(result);
});
