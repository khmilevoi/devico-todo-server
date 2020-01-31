import { emitAllOwners, getAllSockets } from '../configureSocketIO';

import { Role } from '../models/role';
import { List } from '../models/list';
import { Todo } from '../models/todo';

const lists = {
  get: async (ctx) => {
    const { id: owner } = ctx.tokenData;

    const personal = [];
    const shared = [];

    const roles = await Role.findAll({ owner });

    const lists = roles.map(({ list }) => list);

    const listsInformation = await List.findAll({
      where: { id: lists },
    });

    roles.forEach(({ type, list: listId }) => {
      const list = listsInformation.find((item) => item.id === listId);

      if (type === 'creator') {
        personal.push(list);
      } else if (type === 'guest') {
        shared.push(list);
      }
    });

    ctx.resolve({ personal, shared });
  },
  add: async (ctx) => {
    const { body } = ctx.request;
    const { name } = body;

    const { id: owner } = ctx.tokenData;

    const res = await List.create({ name, creator: owner });

    await Role.create({ list: res.id, owner, type: 'creator' });

    ctx.resolve();

    const sockets = await getAllSockets(owner);

    sockets.forEach(({ socket }) => {
      ctx.emit(socket, 'lists', {
        type: 'add',
        res,
      });
    });
  },
  delete: async (ctx) => {
    const { id: listId } = ctx.params;

    const { id: owner } = ctx.tokenData;

    const role = await Role.findOne({ where: { owner, list: listId } });

    if (role && role.type === 'creator') {
      ctx.resolve();

      await emitAllOwners(listId, ({ socket, user }) => {
        ctx.emit(socket, 'lists', {
          type: 'delete',
          id: +listId,
          listType: user === owner ? 'personal' : 'shared',
        });
      });

      await Role.destroy({ where: { list: listId } });
      await List.destroy({ where: { id: listId } });
      await Todo.destroy({ where: { list: listId } });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  toggle: async (ctx) => {
    const { id: listId } = ctx.params;

    const { id: owner } = ctx.tokenData;

    const role = await Role.findOne({ where: { owner, list: listId } });

    if (role && role.type === 'creator') {
      const list = await List.findOne({ where: { id: listId } });
      await List.update({ public: !list.public }, { where: { id: listId } });

      ctx.resolve();

      emitAllOwners(listId, ({ socket, user }) => {
        ctx.emit(socket, 'lists', {
          type: 'toggle',
          id: +listId,
          listType: user === owner ? 'personal' : 'shared',
        });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  share: async (ctx) => {
    const { id: listId } = ctx.params;

    const { body } = ctx.request;
    const { newOwner } = body;

    const { id: owner } = ctx.tokenData;

    const role = await Role.findOne({ where: { owner, list: listId } });

    if (role && role.type === 'creator') {
      if (!(await Role.findOne({ where: { list: listId, owner: newOwner } }))) {
        await Role.create({
          list: listId,
          owner: newOwner,
          type: 'guest',
        });

        ctx.resolve();

        const res = await List.findOne({ where: { id: listId } });

        emitAllOwners(listId, ({ socket, user }) => {
          ctx.emit(socket, 'lists', {
            type: 'share',
            res,
            listType: user === owner ? 'personal' : 'shared',
          });
        });

        ctx.resolve();
      } else {
        ctx.badRequest({ message: 'Role exist' });
      }
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
};

export default lists;
