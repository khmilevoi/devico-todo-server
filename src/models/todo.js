import mongoose from 'mongoose';

const { Schema } = mongoose;

const TodoSchema = new Schema({
  inner: { type: String, required: true },
  completed: { type: Boolean, default: false },
  list: { type: String, required: true },
});

const Todo = mongoose.model('Todo', TodoSchema);

export default Todo;
