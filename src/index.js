import dotenv from 'dotenv';

import Koa from 'koa';
import cors from 'koa-cors';
import logger from 'koa-logger';
import mongoose from 'mongoose';
import bodyParser from 'koa-bodyparser';
import jwt from 'koa-jwt';

import configureRouter from './controllers';
import useResolve from './middlewares';

dotenv.config();

const app = new Koa();

app.use(cors({ methods: '*' }));
app.use(bodyParser());
app.use(logger());
app.use(useResolve());

app.use((ctx, next) => {
  console.log('BODY: ', ctx.request.body);
  console.log('REQUEST: ', ctx.request);
  console.log(ctx);
  return next();
});

app.use((ctx, next) => next().catch((error) => {
  if (error.status === 401) {
    ctx.unauthorized({ message: 'Unauthorized' });
  } else {
    throw error;
  }
}));

app.use(jwt({ secret: process.env.SECRET }).unless({ path: [/^\/auth/] }));

app.use(...configureRouter());

const PORT = 3000;

app.listen(PORT).on('connection', () => {
  console.log(`Connection open to ${PORT}`);
});

const connString = 'mongodb://localhost/todo';
mongoose.connect(connString, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const db = mongoose.connection;

db.once('open', () => {
  console.log(`Open to ${connString}`);
});

db.on('error', (err) => {
  console.log(err);
});
