import mongoose from 'mongoose';
import request from 'supertest';
import http from 'http';
import ioClient from 'socket.io-client';

import ListModel from '../models/list';
import RoleModel from '../models/role';

import { configureKoa } from '../configureKoa';
import { configureSocketIO } from '../configureSocketIO';

import { clear, Target } from './_utils';

describe('Lists test', () => {
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
      PORT: '3001',
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

    const { _id: personalId } = await ListModel.create({
      name: '1',
      creator: auth.body._id,
    });
    const { _id: sharedId } = await ListModel.create({
      name: '2',
      creator: '1',
    });

    await RoleModel.create({
      list: personalId,
      owner: auth.body._id,
      type: 'creator',
    });
    await RoleModel.create({
      list: sharedId,
      owner: auth.body._id,
      type: 'guest',
    });

    const response = await request(app.callback())
      .get('/lists/')
      .set('Authorization', `Bearer ${auth.body.token}`);

    const { shared, personal } = response.body;

    expect(response.status).toBe(200);
    expect(shared).toHaveLength(1);
    expect(personal).toHaveLength(1);

    const [personalList] = personal;
    const [sharedList] = shared;

    expect(personalList._id).toBe(personalId.toString());
    expect(personalList.name).toBe('1');
    expect(personalList.creator).toBe(auth.body._id);

    expect(sharedList._id).toBe(sharedId.toString());
    expect(sharedList.name).toBe('2');
    expect(sharedList.creator).toBe('1');
  });

  it('add', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('add test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    const response = await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);

    const message = await target.wait('add test');

    expect(message.type).toBe('add');
    expect(message.res._id).toBeDefined();
    expect(message.res.name).toBe('addTest');
    expect(message.res.creator).toBe(auth.body._id);
  });

  it('delete', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('delete test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const { res } = await target.wait('delete test');

    const response = await request(app.callback())
      .delete(`/lists/${res._id}`)
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);

    const message = await target.wait('delete test');

    expect(message.type).toBe('delete');
    expect(message.id).toBe(res._id);
    expect(message.listType).toBe('personal');
  });

  it('toggle', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('toggle test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const { res } = await target.wait('toggle test');

    const response = await request(app.callback())
      .put(`/lists/${res._id}`)
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);

    const message = await target.wait('toggle test');

    expect(message.type).toBe('toggle');
    expect(message.id).toBe(res._id);
    expect(message.listType).toBe('personal');
  });

  it('share', async () => {
    const auth = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol', password: '123456' });

    const auth2 = await request(app.callback())
      .post('/auth/')
      .send({ login: 'Lol2', password: '123456' });

    clientSocket.on('lists', (message) => {
      target.dispatch('share test', message);
    });

    clientSocket.emit('auth', auth.body.token);

    await request(app.callback())
      .post('/lists/')
      .send({ name: 'addTest' })
      .set('Authorization', `Bearer ${auth.body.token}`);

    const { res } = await target.wait('share test');

    const response = await request(app.callback())
      .patch(`/lists/${res._id}`)
      .send({ newOwner: auth2.body._id })
      .set('Authorization', `Bearer ${auth.body.token}`);

    expect(response.status).toBe(200);

    const message = await target.wait('share test');

    expect(message.type).toBe('share');

    const role = await RoleModel.findOne({
      owner: auth2.body._id,
      list: message.res._id,
    });

    expect(role.type).toBe('guest');
  });
});
