import RoleModel from '../models/role';
import ListModel from '../models/list';

import { emitAllOwners, getAllSockets } from '../configureSocketIO';

const lists = {
  get: async (ctx) => {
    const { id: owner } = ctx.tokenData;

    const personal = [];
    const shared = [];

    const roles = await RoleModel.find({ owner });

    await Promise.all(
      roles.map(async ({ list: listId, type }) => {
        const list = await ListModel.findById(listId);

        if (type === 'creator') {
          personal.push(list);
        } else if (type === 'guest') {
          shared.push(list);
        }
      }),
    );

    ctx.resolve({ personal, shared });
  },
  add: async (ctx) => {
    const { body } = ctx.request;
    const { name, owner } = body;

    const list = await ListModel.create({ name });
    await RoleModel.create({ list: list._id, owner, type: 'creator' });

    ctx.resolve();

    const sockets = await getAllSockets(owner);

    sockets.forEach(({ socket }) => {
      ctx.emit(socket, 'lists', { type: 'add', list });
    });
  },
  delete: async (ctx) => {
    const { id } = ctx.params;

    const { id: owner } = ctx.tokenData;

    const role = await RoleModel.findOne({ owner, list: id });

    if (role && role.type === 'creator') {
      await RoleModel.deleteMany({ list: id });
      await ListModel.deleteOne({ _id: id });

      ctx.resolve();

      await emitAllOwners(id, ({ socket }) => {
        ctx.emit(socket, 'lists', { type: 'delete', id });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  toggle: async (ctx) => {
    const { id } = ctx.params;

    const { id: owner } = ctx.tokenData;

    const role = await RoleModel.findOne({ owner, list: id });

    if (role && role.type === 'creator') {
      const list = await ListModel.findById(id);
      await ListModel.updateMany(list, { public: !list.public });

      ctx.resolve();

      emitAllOwners(id, ({ socket }) => {
        ctx.emit(socket, 'lists', { type: 'toggle', public: !list.public });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  share: async (ctx) => {
    const { id } = ctx.params;

    const { body } = ctx.request;
    const { owner: newOwner } = body;

    const { id: owner } = ctx.tokenData;

    const role = await RoleModel.findOne({ owner, list: id });

    if (role && role.type === 'creator') {
      if (!(await RoleModel.exists({ list: id, owner: newOwner }))) {
        await RoleModel.create({ list: id, owner: newOwner, type: 'guest' });

        ctx.resolve();

        const list = await ListModel.findById(id);

        emitAllOwners(id, ({ socket }) => {
          ctx.emit(socket, 'lists', { type: 'share', list });
        });

        ctx.resolve();
      }
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
};

export default lists;
