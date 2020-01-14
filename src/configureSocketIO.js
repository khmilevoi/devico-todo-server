import socket from 'socket.io';
import jsonwebtoken from 'jsonwebtoken';

import Socket from './models/socket';

const logger = (socket) => {
  console.log('\x1b[32m%s\x1b[0m', `${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log('\x1b[31m%s\x1b[0m', `${socket.id} disconnected`);
  });
};

export const getAllSockets = (user) => Socket.find({ user });

export const clearAllSockets = () => Socket.deleteMany({});

export const addSocket = async (token, socket) => {
  try {
    const { data } = jsonwebtoken.verify(token, process.env.SECRET);
    const { id: user } = data;

    const row = { user, socket };

    const exist = await Socket.exists(row);

    if (!exist) {
      await Socket.create(row);
    }
  } catch (error) {
    console.log('jwt incorrect');
  }
};

export const deleteSocket = (socket) => Socket.deleteOne({ socket });

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
