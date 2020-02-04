import socket from 'socket.io';
import jsonwebtoken from 'jsonwebtoken';

import { Socket } from './models/socket';
import { Role } from './models/role';
import { List } from './models/list';
import { Token } from './models/token';

import { sequelize } from './database/connection';

import {
  LIVE_REFRESH_TOKEN,
  createRefreshToken,
  createToken,
  LIVE_SESSION_TOKEN,
} from './utils/refresh';

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
    const { id: userId, login } = data;

    const row = { user: userId, socket: socket.id };

    const exist = !!(await Socket.findOne({ where: row }));

    if (!exist) {
      await Socket.create(row);

      const refreshToken = createRefreshToken();

      await Token.create({
        user: userId,
        token: refreshToken,
        socket: socket.id,
      });

      setTimeout(async () => {
        await Token.destroy({ where: { token: refreshToken } });
      }, LIVE_REFRESH_TOKEN);

      socket.emit('auth', {
        refreshToken: {
          token: refreshToken,
          live: LIVE_REFRESH_TOKEN,
        },
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteSocket = (socket) => Socket.destroy({ where: { socket } });

export const configureSocketIO = () => {
  const io = socket({ origins: '*:*' });

  io.on('connection', (socket) => {
    logger(socket);

    socket.on('auth', async (token) => await addSocket(token, socket));

    socket.on('exit', async () => await deleteSocket(socket.id));

    socket.on('disconnect', async () => await deleteSocket(socket.id));
  });

  return io;
};
