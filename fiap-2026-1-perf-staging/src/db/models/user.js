// src/db/models/user.js
import { DataTypes } from 'sequelize';

export function defineUser(sequelize) {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, { tableName: 'users', timestamps: true });
}
