import socket from 'socket.io';
import jsonwebtoken from 'jsonwebtoken';

import SocketModel from './models/socket';
import RoleModel from './models/role';
import ListModel from './models/list';

const logger = (socket) => {
  console.log('\x1b[32m%s\x1b[0m', `${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log('\x1b[31m%s\x1b[0m', `${socket.id} disconnected`);
  });
};

export const getAllSockets = (user) => SocketModel.find({ user });

export const clearAllSockets = () => SocketModel.deleteMany({});

export const emitAllOwners = async (ownerId, callback) => {
  const roles = await RoleModel.find({ owner: ownerId });

  roles.forEach(async ({ owner }) => {
    const sockets = await getAllSockets(owner);

    sockets.forEach((socket) => callback(socket, owner));
  });
};

export const verifyUser = async (owner, listId) => {
  const role = await RoleModel.find({ owner, list: listId });

  if (role && role.type === 'creator') {
    return true;
  }
  if (!role) {
    return false;
  }

  const list = await ListModel.findById(listId);

  if (list && list.public === true) {
    return true;
  }

  return false;
};

export const addSocket = async (token, socket) => {
  try {
    const { data } = jsonwebtoken.verify(token, process.env.SECRET);
    const { id: user } = data;

    const row = { user, socket };

    const exist = await SocketModel.exists(row);

    if (!exist) {
      await SocketModel.create(row);
    }
  } catch (error) {
    console.log('jwt incorrect');
  }
};

export const deleteSocket = (socket) => SocketModel.deleteOne({ socket });

export const configureSocketIO = () => {
  const io = socket({ origins: '*:*' });

  io.on('connection', (socket) => {
    logger(socket);

    socket.on('auth', async (token) => await addSocket(token, socket.id));

    socket.on('exit', async () => await deleteSocket(socket.id));

    socket.on('disconnect', async () => await deleteSocket(socket.id));
  });

  return io;
};
