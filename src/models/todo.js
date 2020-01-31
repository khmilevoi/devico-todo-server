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
  next: { type: DataTypes.INTEGER, references: 'todos', referenceKey: 'id' },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
};

const Todo = sequelize.define('todo', TodoModel, {
  freezeTableName: true,
  tableName: 'todos',
});

export default Todo;
