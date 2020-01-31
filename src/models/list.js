import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export const ListModel = {
  name: { type: DataTypes.STRING, allowNull: false },
  public: { type: DataTypes.BOOLEAN, defaultValue: true },
  creator: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: 'users',
    referenceKey: 'id',
  },
  head: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: 'todos',
    referenceKey: 'id',
  },
  tail: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: 'todos',
    referenceKey: 'id',
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

export const List = sequelize.define('list', ListModel, {
  freezeTableName: true,
  tableName: 'lists',
});
