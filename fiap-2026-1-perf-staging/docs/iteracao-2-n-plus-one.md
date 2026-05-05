# Iteração 2 — N+1 Query

## Endpoint
`GET /orders?limit=50`

## Sintoma medido pelo k6 (`k6/n-plus-one.js`)
- Throughput baixo (~5–10 RPS com 30 VUs)
- Latência média alta (~1–2s por requisição)
- No log do Sequelize (com `logging: console.log`): 51 SELECTs por requisição
  (1 em `orders` + 50 em `order_items`)

## Causa
Em `src/routes/orders.js`, o loop `for (const order of orders)` faz uma
query separada para cada `order` buscar seus `items`. Padrão clássico
de N+1.

## Fix

```js
// ANTES
const orders = await Order.findAll({ limit, order: [['id', 'ASC']] });
const result = [];
for (const order of orders) {
  const items = await OrderItem.findAll({ where: { orderId: order.id } });
  result.push({ ...order.toJSON(), items: items.map((i) => i.toJSON()) });
}

// DEPOIS
const orders = await Order.findAll({
  limit,
  order: [['id', 'ASC']],
  include: [{ model: OrderItem, as: 'items' }],
});
res.json(orders);
```

`include` faz Sequelize emitir 1 query com `LEFT OUTER JOIN`. 51 queries
viram 1.

## Resultado esperado após fix

| Métrica | Antes | Depois | Melhoria |
|---|---|---|---|
| Queries por request | 51 | 1 | 51× |
| P95 | ~1500ms | ~80ms | 18× |
| Throughput | ~8 RPS | ~200 RPS | 25× |

## Conceito ensinado
- ORMs e o pitfall do lazy loading
- Custo de round-trips ao banco
- Throughput como métrica primária quando latência segue volume
