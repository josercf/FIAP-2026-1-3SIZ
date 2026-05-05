// src/db/models/orderItem.js
import { DataTypes } from 'sequelize';

export function defineOrderItem(sequelize) {
  return sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  }, { tableName: 'order_items', timestamps: false });
}
