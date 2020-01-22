import mongoose from 'mongoose';
import request from 'supertest';

import jsonwebtoken from 'jsonwebtoken';
import UserModel from '../models/user';

import { encrypt } from '../controllers/auth';
import { configureKoa } from '../configureKoa';
import { configureSocketIO } from '../configureSocketIO';

import { clear } from './_utils';

describe('Auth test', () => {
  let io;
  let app;

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
          console.error(err);
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
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await clear();
  });

  it('login', async () => {
    const login = 'Lol';
    const password = '123456';

    const { id } = await UserModel.create({
      login,
      password: await encrypt(password),
    });

    const response = await request(app.callback())
      .put('/auth/')
      .send({ login, password });

    expect(response.body.token).toBeDefined();
    expect(response.body._id).toBe(id);
    expect(response.body.login).toBe(login);

    const parsedToken = jsonwebtoken.verify(
      response.body.token,
      process.env.SECRET,
    );

    expect(parsedToken.data.login).toBe(login);
    expect(parsedToken.data.id).toBe(id);
  });

  it('register', async () => {
    const login = 'Lol';
    const password = '123456';

    const response = await request(app.callback())
      .post('/auth/')
      .send({ login, password });

    const user = await UserModel.findOne({ login });

    expect(response.body.token).toBeDefined();
    expect(response.body._id).toBe(user._id.toString());
    expect(response.body.login).toBe(login);

    const parsedToken = jsonwebtoken.verify(
      response.body.token,
      process.env.SECRET,
    );

    expect(parsedToken.data.login).toBe(login);
    expect(parsedToken.data.id).toBe(user._id.toString());
  });
});
