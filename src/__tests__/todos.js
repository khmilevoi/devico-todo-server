import mongoose from 'mongoose';
import request from 'supertest';
import http from 'http';
import ioClient from 'socket.io-client';

import TodoModel from '../models/todo';

import { configureKoa } from '../configureKoa';
import { configureSocketIO } from '../configureSocketIO';

import { clear, Target } from './_utils';

describe('Todos test', () => {
  const target = new Target();

  let io;
  let clientSocket;
  let app;
  let httpServer;

  beforeAll(async () => {
    await mongoose.connect(
      global.__MONGO_URI__,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
      },
      (err) => {
        if (err) {
          process.exit(1);
        }
      },
    );

    process.env = {
      SECRET: 'jwt_secret',
      SALT: '$2b$10$haQuUNZyq4zsqxJc3ezege',
      PORT: '3000',
    };

    io = configureSocketIO();
    app = configureKoa(io);

    httpServer = http.createServer().listen(process.env.PORT);
    io.listen(httpServer);
  });

  afterAll(() => {
    io.close();
    httpServer.close();
    mongoose.connection.close();
  });

  beforeEach(
    () => new Promise((resolve) => {
      clientSocket = ioClient.connect(
        `http://localhost:${process.env.PORT}`,
        {
          'reconnection delay': 0,
          'reopen delay': 0,
          'force new connection': true,
          transports: ['websocket'],
        },
      );

      clientSocket.on('connect', () => resolve());
    }),
  );

  afterEach(async () => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }

    await clear();
  });

  it('get', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('get test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const list = await target.wait('get test');

    await TodoModel.create({ inner: 'trash', list: list.res._id });

    const response = await request(app.callback())
      .get(`/todos?list=${list.res._id}`)
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.list).toBe(list.res._id);
    expect(response.body.head).toBe(null);
    expect(response.body.tail).toBe(null);

    expect(response.body.res).toHaveLength(1);

    const [todo] = response.body.res;

    expect(todo._id).toBeDefined();
    expect(todo.inner).toBe('trash');
    expect(todo.list).toBe(list.res._id);
  });

  it('add', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('add test', message);
    });

    clientSocket.on('todos', (message) => {
      target.dispatch('add test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const list = await target.wait('add test');

    const response = await request(app.callback())
      .post(`/todos?list=${list.res._id}`)
      .send({ inner: 'trash' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);

    const message = await target.wait('add test');

    expect(message.type).toBe('add');
    expect(message.res.completed).toBe(false);
    expect(message.res.next).toBe(null);
    expect(message.res.inner).toBe('trash');
    expect(message.res.list).toBe(list.res._id);
    expect(message.res._id).toBeDefined();
  });

  it('toggle', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('toggle test', message);
    });

    clientSocket.on('todos', (message) => {
      target.dispatch('toggle test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const list = await target.wait('toggle test');

    await request(app.callback())
      .post(`/todos?list=${list.res._id}`)
      .send({ inner: 'trash' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const todo = await target.wait('toggle test');

    const response = await request(app.callback())
      .put(`/todos/${todo.res._id}`)
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);

    const message = await target.wait('toggle test');

    expect(message.type).toBe('toggle');
    expect(message.id).toBeDefined();
    expect(message.list).toBe(list.res._id);
  });

  it('delete', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('delete test', message);
    });

    clientSocket.on('todos', (message) => {
      target.dispatch('delete test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const list = await target.wait('delete test');

    await request(app.callback())
      .post(`/todos?list=${list.res._id}`)
      .send({ inner: 'trash' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const todo = await target.wait('delete test');

    const response = await request(app.callback())
      .delete(`/todos/${todo.res._id}`)
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);

    const message = await target.wait('delete test');

    expect(message.type).toBe('delete');
    expect(message.id).toBeDefined();
    expect(message.list).toBe(list.res._id);
  });

  it('update', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('update test', message);
    });

    clientSocket.on('todos', (message) => {
      target.dispatch('update test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const list = await target.wait('update test');

    await request(app.callback())
      .post(`/todos?list=${list.res._id}`)
      .send({ inner: 'trash' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const todo = await target.wait('update test');

    const response = await request(app.callback())
      .patch(`/todos/${todo.res._id}`)
      .send({ type: 'update', inner: 'trash2' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);

    const message = await target.wait('update test');

    expect(message.type).toBe('update');
    expect(message.id).toBeDefined();
    expect(message.list).toBe(list.res._id);
    expect(message.inner).toBe('trash2');
  });

  it('move', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('move test', message);
    });

    clientSocket.on('todos', (message) => {
      target.dispatch('move test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const list = await target.wait('move test');

    await request(app.callback())
      .post(`/todos?list=${list.res._id}`)
      .send({ inner: 'trash' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const todo = await target.wait('move test');

    await request(app.callback())
      .post(`/todos?list=${list.res._id}`)
      .send({ inner: 'trash' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const prev = await target.wait('move test');

    const response = await request(app.callback())
      .patch(`/todos/${todo.res._id}`)
      .send({ type: 'move', prev: prev.res._id })
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);

    const message = await target.wait('move test');

    expect(message.type).toBe('move');
    expect(message.id).toBeDefined();
    expect(message.list).toBe(list.res._id);
    expect(message.prev).toBe(prev.res._id);
  });
});
