import Koa from 'koa';
import cors from 'koa-cors';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import jwt from 'koa-jwt';

import { configureRouter } from './controllers';

import { useResolve, useEmit } from './middlewares';

export const configureKoa = (io) => {
  const app = new Koa();

  app.use(cors({ methods: '*' }));
  app.use(bodyParser());
  app.use(logger());
  app.use(useResolve());
  app.use(useEmit(io));

  app.use((ctx, next) => {
    console.log('BODY: ', ctx.request.body);
    console.log('REQUEST: ', ctx.request);
    return next();
  });

  app.use((ctx, next) => next().catch((error) => {
    if (error.status === 401) {
      ctx.unauthorized({ message: 'Unauthorized' });
    } else {
      throw error;
    }
  }));

  app.use(
    jwt({ secret: process.env.SECRET }).unless({
      path: [/^\/(auth|socket.io)/],
    }),
  );

  app.use(...configureRouter());

  return app;
};
