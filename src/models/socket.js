import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export const SocketModel = {
  user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: 'users',
    referenceKey: 'id',
  },
  socket: { type: DataTypes.STRING, allowNull: false },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
};

export const Socket = sequelize.define('socket', SocketModel, {
  freezeTableName: true,
  tableName: 'sockets',
});
