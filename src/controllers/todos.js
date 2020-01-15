import TodoModel from '../models/todo';

import { emitAllOwners, verifyUser } from '../configureSocketIO';

const todos = {
  get: async (ctx) => {
    const { list } = ctx.query;

    const res = await TodoModel.find({ list });

    ctx.resolve({ res });
  },
  add: async (ctx) => {
    const { body } = ctx.request;
    const { inner, list: listId } = body;

    const { id: owner } = ctx.tokenData;

    if (verifyUser(owner, listId)) {
      const res = await TodoModel.create({ inner, list: listId });

      ctx.resolve();

      emitAllOwners(owner, ({ socket }) => {
        ctx.emit(socket, 'todos', { type: 'add', res });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  toggle: async (ctx) => {
    const { id, list: listId } = ctx.params;

    const { id: owner } = ctx.tokenData;

    if (verifyUser(owner, listId)) {
      const todo = await TodoModel.findById(id);
      await TodoModel.updateOne(todo, { completed: !todo.completed });

      ctx.resolve();

      emitAllOwners(owner, ({ socket }) => {
        ctx.emit(socket, 'todos', { type: 'toggle', id, list: listId });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  delete: async (ctx) => {
    const { id } = ctx.params;

    const { body } = ctx.request;
    const { list: listId } = body;

    const { id: owner } = ctx.tokenData;

    if (verifyUser(owner, listId)) {
      await TodoModel.deleteOne({ _id: id });

      ctx.resolve();

      emitAllOwners(owner, ({ socket }) => {
        ctx.emit(socket, 'todos', { type: 'delete', id, list: listId });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  update: async (ctx) => {
    const { id, list: listId } = ctx.params;

    const { body } = ctx.request;
    const { inner } = body;

    const { id: owner } = ctx.tokenData;

    if (verifyUser(owner, listId)) {
      const todo = await TodoModel.findById(id);
      await TodoModel.updateOne(todo, { inner });

      ctx.resolve();

      emitAllOwners(owner, ({ socket }) => {
        ctx.emit(socket, 'todos', {
          type: 'update',
          id,
          inner,
          list: listId,
        });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
};

export default todos;
