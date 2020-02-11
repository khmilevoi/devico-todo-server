import { emitAllOwners, verifyUser } from '../configureSocketIO';

import { sequelize } from '../database/connection';

import { Todo } from '../models/todo';
import { List } from '../models/list';
import { Role } from '../models/role';

import { sendPush } from '../utils/push';

const todos = {
  get: async (ctx) => {
    const { list, start, amount } = ctx.query;

    const { id: owner } = ctx.tokenData;

    if (await verifyUser(owner, list, true)) {
      const { head, tail } = await List.findOne({ where: { id: list } });
      const res = await sequelize.query(
        `call createList(${+start || head}, ${+amount || 15});`,
      );

      const prev = await Todo.findOne({ where: { next: start } });

      ctx.resolve({
        res,
        list,
        head,
        tail,
        prev,
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  add: async (ctx) => {
    const { list: listId } = ctx.query;

    const { body } = ctx.request;
    const { inner } = body;

    const { id: owner, login } = ctx.tokenData;

    if (await verifyUser(owner, listId)) {
      const res = await Todo.create({ text: inner, list: listId });

      const {
        head, tail, name, creator,
      } = await List.findOne({
        where: { id: listId },
      });
      await List.update({ tail: res.id }, { where: { id: listId } });

      if (!head) {
        await List.update({ head: res.id }, { where: { id: listId } });
      }

      if (tail) {
        await Todo.update({ next: res.id }, { where: { id: tail } });
      }

      ctx.resolve();

      const role = await Role.findOne({
        where: { owner, list: listId },
      });

      const shortenedInner = inner.slice(0, 20).trim();

      emitAllOwners(listId, ({ socket, user }) => {
        sendPush(user, `${login} add todo to ${name}(${shortenedInner}...)`);

        ctx.emit(socket, 'todos', {
          type: 'add',
          res,
          list: +listId,
          tail: +tail,
          isCreator: +creator === +user,
        });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  toggle: async (ctx) => {
    const { id: todoId } = ctx.params;

    const { id: owner } = ctx.tokenData;

    const { list: listId } = await Todo.findOne({ where: { id: todoId } });

    if (await verifyUser(owner, listId)) {
      const todo = await Todo.findOne({ where: { id: todoId } });
      await Todo.update(
        { completed: !todo.completed },
        { where: { id: todo.id } },
      );

      ctx.resolve();

      emitAllOwners(listId, ({ socket }) => {
        ctx.emit(socket, 'todos', {
          type: 'toggle',
          id: +todoId,
          list: +listId,
        });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  delete: async (ctx) => {
    const { id: todoId } = ctx.params;

    const { id: owner } = ctx.tokenData;

    const { list: listId, next } = await Todo.findOne({
      where: { id: todoId },
    });

    if (await verifyUser(owner, listId)) {
      const prev = await Todo.findOne({ where: { next: todoId } });
      await Todo.update({ next }, { where: { next: todoId } });

      if (!next) {
        await List.update(
          { tail: prev ? prev.id : null },
          { where: { id: listId } },
        );
      }

      const currentList = await List.findOne({ where: { id: listId } });

      if (currentList.head === +todoId) {
        await List.update({ head: next }, { where: { id: listId } });
      }

      await Todo.destroy({ where: { id: todoId } });

      ctx.resolve();

      emitAllOwners(listId, ({ socket, user }) => {
        ctx.emit(socket, 'todos', {
          type: 'delete',
          id: +todoId,
          list: +listId,
          prev: prev && +prev.id,
          next,
          isCreator: +currentList.creator === +user,
        });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  update: async (ctx) => {
    const { id: todoId } = ctx.params;

    const { body } = ctx.request;
    const { inner } = body;

    const { list: listId } = await Todo.findOne({ where: { id: todoId } });

    const { id: owner, login } = ctx.tokenData;

    if (await verifyUser(owner, listId)) {
      await Todo.update({ text: inner }, { where: { id: todoId } });

      ctx.resolve();

      const { name } = await List.findOne({ where: { id: listId } });

      const shortenedInner = inner.slice(0, 20).trim();

      emitAllOwners(listId, ({ socket, user }) => {
        sendPush(user, `${login} update todo in ${name}(${shortenedInner}...)`);

        ctx.emit(socket, 'todos', {
          type: 'update',
          id: +todoId,
          inner,
          list: +listId,
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

    const current = await Todo.findOne({ where: { id: todoId } });

    const { id: owner } = ctx.tokenData;

    if (await verifyUser(owner, current.list)) {
      const prevItem = await Todo.findOne({ where: { next: todoId } });
      await Todo.update({ next: current.next }, { where: { next: todoId } });

      const currentList = await List.findOne({ where: { id: current.list } });

      if (currentList.head === +todoId) {
        await List.update(
          { head: current.next },
          { where: { id: current.list } },
        );
      }

      if (!current.next) {
        await List.update(
          { tail: prevItem._id },
          { where: { id: current.list } },
        );
      }

      if (prevId) {
        const prev = await Todo.findOne({ where: { id: prevId } });

        if (!prev.next) {
          await List.update({ tail: todoId }, { where: { id: current.list } });
        }

        await Todo.update({ next: prev.next }, { where: { id: todoId } });
        await Todo.update({ next: todoId }, { where: { id: prev.id } });
      } else {
        const { head } = await List.findOne({ where: { id: current.list } });

        await Todo.update({ next: head }, { where: { id: todoId } });

        await List.update({ head: todoId }, { where: { id: current.list } });
      }

      ctx.resolve();

      emitAllOwners(current.list, ({ socket, user }) => {
        ctx.emit(socket, 'todos', {
          type: 'move',
          id: +todoId,
          prev: +prevId,
          list: +current.list,
          isCreator: +currentList.creator === +user,
        });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
};

export default todos;
