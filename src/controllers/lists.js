import RoleModel from '../models/role';
import ListModel from '../models/list';
import TodoModel from '../models/todo';

import { emitAllOwners, getAllSockets } from '../configureSocketIO';

const lists = {
  get: async (ctx) => {
    const { id: owner } = ctx.tokenData;

    const personal = [];
    const shared = [];

    const roles = await RoleModel.find({ owner });

    const lists = roles.map(({ list }) => list);

    const listsInformation = await ListModel.find({ _id: { $in: lists } });

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

    const res = await ListModel.create({ name, creator: owner });
    await RoleModel.create({ list: res.id, owner, type: 'creator' });

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

    const role = await RoleModel.findOne({ owner, list: listId });

    if (role && role.type === 'creator') {
      await ListModel.deleteOne({ _id: listId });
      await TodoModel.deleteMany({ list: listId });

      ctx.resolve();

      emitAllOwners(listId, ({ socket, user }) => {
        ctx.emit(socket, 'lists', {
          type: 'delete',
          id: listId,
          listType: user === owner ? 'personal' : 'shared',
        });
      });

      await RoleModel.deleteMany({ list: listId });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  toggle: async (ctx) => {
    const { id: listId } = ctx.params;

    const { id: owner } = ctx.tokenData;

    const role = await RoleModel.findOne({ owner, list: listId });

    if (role && role.type === 'creator') {
      const list = await ListModel.findById(listId);
      await ListModel.updateMany(list, { public: !list.public });

      ctx.resolve();

      emitAllOwners(listId, ({ socket, user }) => {
        ctx.emit(socket, 'lists', {
          type: 'toggle',
          id: listId,
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

    const role = await RoleModel.findOne({ owner, list: listId });

    if (role && role.type === 'creator') {
      if (!(await RoleModel.exists({ list: listId, owner: newOwner }))) {
        await RoleModel.create({
          list: listId,
          owner: newOwner,
          type: 'guest',
        });

        ctx.resolve();

        const res = await ListModel.findById(listId);

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
