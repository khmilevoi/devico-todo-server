import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export const UserModel = {
  login: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
};

export const User = sequelize.define('user', UserModel, {
  freezeTableName: true,
  tableName: 'users',
});
