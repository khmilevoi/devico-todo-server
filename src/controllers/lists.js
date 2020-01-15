import RoleModel from '../models/role';
import ListModel from '../models/list';

import { emitAllOwners, getAllSockets } from '../configureSocketIO';

const lists = {
  get: async (ctx) => {
    const { owner } = ctx.query;

    const personal = (
      await RoleModel.find({ owner, type: 'creator' })
    ).map(({ list }) => ListModel.findById(list));

    const shared = await RoleModel.find({
      owner,
      typw: 'guest',
    }).map(({ list }) => ListModel.findById(list));

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

    const owner = ctx.tokenData;

    const role = RoleModel.findOne({ owner: owner.id, list: id });

    if (role && role.type === 'creator') {
      await RoleModel.deleteMany({ id });
      await ListModel.deleteOne({ _id: id });

      ctx.resolve();

      emitAllOwners(id, ({ socket }) => {
        ctx.emit(socket, 'lists', { type: 'delete', id });
      });
    } else {
      ctx.badRequest({ message: 'You don`t have access' });
    }
  },
  toggle: async (ctx) => {
    const { id } = ctx.params;

    const owner = ctx.tokenData;

    const role = RoleModel.findOne({ owner: owner.id, list: id });

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
};

export default lists;
