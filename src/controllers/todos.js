import TodoModel from '../models/todo';
import ListModel from '../models/list';

import { emitAllOwners, verifyUser } from '../configureSocketIO';

const todos = {
  get: async (ctx) => {
    const { list } = ctx.query;

    const res = await TodoModel.find({ list });
    const { head, tail } = await ListModel.findById(list);

    ctx.resolve({
      res,
      list,
      head,
      tail,
    });
  },
  add: async (ctx) => {
    const { list: listId } = ctx.query;

    const { body } = ctx.request;
    const { inner } = body;

    const { id: owner } = ctx.tokenData;

    if (await verifyUser(owner, listId)) {
      const res = await TodoModel.create({ inner, list: listId });

      const { head, tail } = await ListModel.findById(listId);
      await ListModel.updateOne(
        { _id: listId },
        {
          tail: res._id,
        },
      );

      if (!head) {
        await ListModel.updateOne({ _id: listId }, { head: res._id });
      }

      if (tail) {
        await TodoModel.updateOne({ _id: tail }, { next: res._id });
      }

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

    const { list: listId, next } = await TodoModel.findById(todoId);

    if (await verifyUser(owner, listId)) {
      const prev = await TodoModel.findOneAndUpdate({ next: todoId }, { next });
      await TodoModel.deleteOne({ _id: todoId });

      if (!next) {
        await ListModel.updateOne({ _id: listId }, { tail: prev._id });
      }

      const currentList = await ListModel.findById(listId);

      if (currentList.head === todoId) {
        await ListModel.updateOne({ _id: listId }, { head: next });
      }

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
      await TodoModel.findByIdAndUpdate(todoId, { inner });

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
  move: async (ctx) => {
    const { id: todoId } = ctx.params;

    const { body } = ctx.request;
    const { prev: prevId } = body;

    const current = await TodoModel.findById(todoId);

    const { id: owner } = ctx.tokenData;

    if (await verifyUser(owner, current.list)) {
      const prevItem = await TodoModel.findOneAndUpdate(
        { next: todoId },
        { next: current.next },
      );

      const currentList = await ListModel.findById(current.list);

      if (currentList.head === todoId) {
        await ListModel.updateOne(
          { _id: current.list },
          { head: current.next },
        );
      }

      if (!current.next) {
        await ListModel.updateOne(
          { _id: current.list },
          { tail: prevItem._id },
        );
      }

      if (prevId) {
        const prev = await TodoModel.findById(prevId);

        if (!prev.next) {
          await ListModel.updateOne({ _id: current.list }, { tail: todoId });
        }

        await TodoModel.updateOne({ _id: todoId }, { next: prev.next });
        await TodoModel.updateOne({ _id: prev._id }, { next: todoId });
      } else {
        const { head } = await ListModel.findById(current.list);

        await TodoModel.updateOne({ _id: todoId }, { next: head });

        await ListModel.updateOne({ _id: current.list }, { head: todoId });
      }

      ctx.resolve();

      emitAllOwners(current.list, ({ socket }) => {
        ctx.emit(socket, 'todos', {
          type: 'move',
          id: todoId,
          prev: prevId,
          list: current.list,
        });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
};

export default todos;
