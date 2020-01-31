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
};

const Socket = sequelize.define('socket', SocketModel, {
  freezeTableName: true,
  tableName: 'sockets',
});

export default Socket;
