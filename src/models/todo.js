import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export const TodoModel = {
  text: { type: DataTypes.STRING, allowNull: false },
  list: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: 'lists',
    referenceKey: 'id',
  },
  next: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: 'todos',
    referenceKey: 'id',
  },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
};

export const Todo = sequelize.define('todo', TodoModel, {
  freezeTableName: true,
  tableName: 'todos',
});
