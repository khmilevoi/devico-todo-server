import dotenv from 'dotenv';
import http from 'http';

import { configureKoa } from './configureKoa';
// import { configureMongo } from './configureMongo';
import { configureSocketIO, clearAllSockets } from './configureSocketIO';

dotenv.config();

const PORT = process.env.PORT || 3000;

const io = configureSocketIO();

const app = configureKoa(io);

const server = http.createServer(app.callback());
io.listen(server);

// configureMongo();

server.listen(PORT).on('listening', async () => {
  console.log(`Connection open t ${PORT}`);

  // await clearAllSockets();
});
