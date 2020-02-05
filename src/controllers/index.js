import Router from 'koa-router';

import usersRouter from './users';
import listController from './lists';
import todosController from './todos';
import authController from './auth';
import tokenController from './token';

const configureUsersRouter = () => {
  const router = new Router({ prefix: '/users' });

  router.get('/', usersRouter.get);

  return router.routes();
};

const configureListRouter = () => {
  const router = new Router({ prefix: '/lists' });

  router.get('/', listController.get);
  router.post('/', listController.add);
  router.put('/:id', listController.toggle);
  router.delete('/:id', listController.delete);
  router.patch('/:id', listController.share);

  return router.routes();
};

const configureTodosRouter = () => {
  const router = new Router({ prefix: '/todos' });

  router.get('/', todosController.get);
  router.post('/', todosController.add);
  router.put('/:id', todosController.toggle);
  router.delete('/:id', todosController.delete);
  router.patch('/:id', (ctx, next) => {
    const { body } = ctx.request;
    const { type } = body;

    switch (type) {
      case 'update': {
        return todosController.update(ctx);
      }

      case 'move': {
        return todosController.move(ctx);
      }

      default: {
        return next();
      }
    }
  });

  return router.routes();
};

const configureAuthRouter = () => {
  const router = new Router({ prefix: '/auth' });

  router.post('/check', authController.check);
  router.post('/', authController.register);
  router.put('/', authController.login);

  return router.routes();
};

const configureTokenRouter = () => {
  const router = new Router({ prefix: '/token' });

  router.post('/', tokenController.updateSession);
  router.post('/refresh', tokenController.updateRefresh);

  return router.routes();
};

export const configureRouter = () => {
  const router = new Router();

  router.use(configureAuthRouter());
  router.use(configureUsersRouter());
  router.use(configureListRouter());
  router.use(configureTodosRouter());
  router.use(configureTokenRouter());

  return [router.routes(), router.allowedMethods()];
};
