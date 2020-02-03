import socket from 'socket.io';
import jsonwebtoken from 'jsonwebtoken';

import { Socket } from './models/socket';
import { Role } from './models/role';
import { List } from './models/list';
import { sequelize } from './database/connection';

const logger = (socket) => {
  console.log('\x1b[32m%s\x1b[0m', `${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log('\x1b[31m%s\x1b[0m', `${socket.id} disconnected`);
  });
};

export const getAllSockets = (user) => Socket.findAll({ where: { user } });

export const clearAllSockets = () => Socket.destroy({ where: {} });

export const emitAllOwners = async (listId, callback) => {
  const [sockets] = await sequelize.query(
    `
    select 
      sockets.socket as socket,
      sockets.user as user
    from sockets, roles 
    where roles.list = ${listId} and roles.owner = sockets.user;
    `,
  );

  sockets.forEach((socket) => callback(socket));
};

export const verifyUser = async (owner, listId, easy) => {
  const role = await Role.findOne({ where: { owner, list: listId } });

  if (!role) {
    return false;
  }

  if (role.type === 'creator') {
    return true;
  }

  if (easy) {
    return true;
  }

  const list = await List.findOne({ where: { id: listId } });

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

    const exist = !!(await Socket.findOne({ where: row }));

    if (!exist) {
      await Socket.create(row);
    }
  } catch (error) {
    console.log('jwt incorrect');
  }
};

export const deleteSocket = (socket) => Socket.destroy({ where: { socket } });

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
