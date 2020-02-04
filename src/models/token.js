import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export const TokenModel = {
  token: { type: DataTypes.STRING, allowNull: false },
  user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: 'users',
    referenceKey: 'id',
  },
  socket: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
};

export const Token = sequelize.define('tokens', TokenModel, {
  freezeTableName: true,
  tableName: 'tokens',
});
