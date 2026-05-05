// src/db/models/product.js
import { DataTypes } from 'sequelize';

export function defineProduct(sequelize) {
  return sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    popularity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, { tableName: 'products', timestamps: true });
}
