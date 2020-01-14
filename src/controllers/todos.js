import TodoModel from '../models/todo';

import { getAllSockets } from '../configureSocketIO';

const todos = {
  list: async (ctx) => {
    const { owner } = ctx.query;

    const res = await TodoModel.find({ owner });

    ctx.resolve({ res });
  },
  todo: async (ctx) => {
    const { id } = ctx.params;

    const res = await TodoModel.findById(id);

    ctx.resolve({ res });
  },
  add: async (ctx) => {
    const { body } = ctx.request;
    const { inner, owner } = body;

    const res = await TodoModel.create({ inner, owner });

    ctx.resolve();

    const sockets = await getAllSockets(owner);

    sockets.forEach(({ socket }) => {
      ctx.emit(socket, 'todos', { type: 'add', res });
    });
  },
  toggle: async (ctx) => {
    const { id } = ctx.params;

    const todo = await TodoModel.findById(id);
    await TodoModel.updateOne(todo, { completed: !todo.completed });

    ctx.resolve();

    const sockets = await getAllSockets(todo.owner);

    sockets.forEach(({ socket }) => {
      ctx.emit(socket, 'todos', { type: 'toggle', id });
    });
  },
  delete: async (ctx) => {
    const { id } = ctx.params;

    const { owner } = await TodoModel.findById(id);
    await TodoModel.deleteOne({ _id: id });

    ctx.resolve();

    const sockets = await getAllSockets(owner);

    sockets.forEach(({ socket }) => {
      ctx.emit(socket, 'todos', { type: 'delete', id });
    });
  },
  update: async (ctx) => {
    const { id } = ctx.params;

    const { body } = ctx.request;
    const { inner } = body;

    const todo = await TodoModel.findById(id);
    await TodoModel.updateOne(todo, { inner });

    ctx.resolve();

    const sockets = await getAllSockets(todo.owner);

    sockets.forEach(({ socket }) => {
      ctx.emit(socket, 'todos', { type: 'update', id, inner });
    });
  },
};

export default todos;
