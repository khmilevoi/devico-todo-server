import dotenv from 'dotenv';
import http from 'http';

import { configureKoa } from './configureKoa';
import { configureSocketIO, clearAllSockets } from './configureSocketIO';
import { tableGenerator } from './database/connection';

import { UserModel } from './models/user';
import { ListModel } from './models/list';
import { SocketModel } from './models/socket';
import { TodoModel } from './models/todo';
import { RoleModel } from './models/role';

import { createReferences } from './models/references';

dotenv.config();

const PORT = process.env.PORT || 3000;

const io = configureSocketIO();

const app = configureKoa(io);

const server = http.createServer(app.callback());
io.listen(server);

server.listen(PORT).on('listening', async () => {
  console.log(`Connection open t ${PORT}`);

  await clearAllSockets();
});

createReferences();

tableGenerator.add('lists', ListModel);
tableGenerator.add('roles', RoleModel);
tableGenerator.add('sockets', SocketModel);
tableGenerator.add('todos', TodoModel);
tableGenerator.add('users', UserModel);

tableGenerator.createReferences();
