// src/db/seed.js
import { faker } from '@faker-js/faker';
import { sequelize, syncDb, User, Product, Order, OrderItem } from './index.js';

const N_USERS = 1000;
const N_PRODUCTS = 200;
const ORDERS_PER_USER = 5;
const ITEMS_PER_ORDER = 3;

async function run() {
  console.log('[seed] sync (force=true)...');
  await syncDb({ force: true });

  console.log(`[seed] ${N_USERS} users...`);
  const users = await User.bulkCreate(
    Array.from({ length: N_USERS }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
    }))
  );

  console.log(`[seed] ${N_PRODUCTS} products...`);
  const products = await Product.bulkCreate(
    Array.from({ length: N_PRODUCTS }, () => ({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      popularity: faker.number.int({ min: 0, max: 1000 }),
      stock: faker.number.int({ min: 0, max: 500 }),
    }))
  );

  console.log(`[seed] ${N_USERS * ORDERS_PER_USER} orders + items...`);
  for (const user of users) {
    const orders = await Order.bulkCreate(
      Array.from({ length: ORDERS_PER_USER }, () => ({
        userId: user.id,
        total: parseFloat(faker.commerce.price({ min: 50, max: 5000 })),
        status: faker.helpers.arrayElement(['pending', 'paid', 'shipped', 'delivered']),
      }))
    );

    const itemsBatch = [];
    for (const order of orders) {
      for (let i = 0; i < ITEMS_PER_ORDER; i++) {
        const product = faker.helpers.arrayElement(products);
        itemsBatch.push({
          orderId: order.id,
          productId: product.id,
          qty: faker.number.int({ min: 1, max: 5 }),
          unitPrice: product.price,
        });
      }
    }
    await OrderItem.bulkCreate(itemsBatch);
  }

  console.log('[seed] done.');
  await sequelize.close();
}

run().catch((err) => {
  console.error('[seed] fatal:', err);
  process.exit(1);
});
