// src/db/index.js
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // troque para console.log para ver queries (útil na iteração 2)
});

import { defineUser } from './models/user.js';
import { defineOrder } from './models/order.js';
import { defineOrderItem } from './models/orderItem.js';
import { defineProduct } from './models/product.js';

export const User = defineUser(sequelize);
export const Order = defineOrder(sequelize);
export const OrderItem = defineOrderItem(sequelize);
export const Product = defineProduct(sequelize);

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export async function syncDb({ force = false } = {}) {
  await sequelize.sync({ force });
}
