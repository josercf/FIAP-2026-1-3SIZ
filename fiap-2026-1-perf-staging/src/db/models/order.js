// src/db/models/order.js
import { DataTypes } from 'sequelize';

export function defineOrder(sequelize) {
  return sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  }, { tableName: 'orders', timestamps: true });
}
