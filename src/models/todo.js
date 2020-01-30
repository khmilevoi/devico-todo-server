// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const TodoSchema = new Schema({
//   inner: { type: String, required: true },
//   completed: { type: Boolean, default: false },
//   list: { type: String, required: true },
//   next: { type: String, default: null },
// });

// const Todo = mongoose.model('Todo', TodoSchema);

// export default Todo;

import { DataTypes } from 'sequelize';
import { sequelize } from '../configureDB';

const TodoModel = {
  inner: { type: DataTypes.STRING, allowNull: false },
  list: { type: DataTypes.STRING, allowNull: false },
  next: { type: DataTypes.STRING },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
};

const Todo = sequelize.define('todo', TodoModel, {
  freezeTableName: true,
  tableName: 'todos',
});

export default Todo;
