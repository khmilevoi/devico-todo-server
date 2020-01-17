import TodoModel from '../models/todo';

import { emitAllOwners, verifyUser } from '../configureSocketIO';

const todos = {
  get: async (ctx) => {
    const { list } = ctx.query;

    const res = await TodoModel.find({ list });

    ctx.resolve({ res, list });
  },
  add: async (ctx) => {
    const { list: listId } = ctx.query;

    const { body } = ctx.request;
    const { inner } = body;

    const { id: owner } = ctx.tokenData;

    if (await verifyUser(owner, listId)) {
      const res = await TodoModel.create({ inner, list: listId });

      ctx.resolve();

      emitAllOwners(listId, ({ socket }) => {
        ctx.emit(socket, 'todos', { type: 'add', res, list: listId });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  toggle: async (ctx) => {
    const { id: todoId } = ctx.params;

    const { id: owner } = ctx.tokenData;

    const { list: listId } = await TodoModel.findById(todoId);

    if (await verifyUser(owner, listId)) {
      const todo = await TodoModel.findById(todoId);
      await TodoModel.updateOne(todo, { completed: !todo.completed });

      ctx.resolve();

      emitAllOwners(listId, ({ socket }) => {
        ctx.emit(socket, 'todos', { type: 'toggle', id: todoId, list: listId });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  delete: async (ctx) => {
    const { id: todoId } = ctx.params;

    const { id: owner } = ctx.tokenData;

    const { list: listId } = await TodoModel.findById(todoId);

    if (await verifyUser(owner, listId)) {
      await TodoModel.deleteOne({ _id: todoId });

      ctx.resolve();

      emitAllOwners(listId, ({ socket }) => {
        ctx.emit(socket, 'todos', { type: 'delete', id: todoId, list: listId });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  update: async (ctx) => {
    const { id: todoId } = ctx.params;

    const { body } = ctx.request;
    const { inner } = body;

    const { list: listId } = await TodoModel.findById(todoId);

    const { id: owner } = ctx.tokenData;

    if (await verifyUser(owner, listId)) {
      const todo = await TodoModel.findById(todoId);
      await TodoModel.updateOne(todo, { inner });

      ctx.resolve();

      emitAllOwners(listId, ({ socket }) => {
        ctx.emit(socket, 'todos', {
          type: 'update',
          id: todoId,
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
