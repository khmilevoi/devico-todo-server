import Router from 'koa-router';

import usersRouter from './users';
import listController from './lists';
import todosController from './todos';
import authController from './auth';

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
  router.patch('/:id', todosController.update);

  return router.routes();
};

const configureAuthRouter = () => {
  const router = new Router({ prefix: '/auth' });

  router.post('/', authController.register);
  router.put('/', authController.login);

  return router.routes();
};

export const configureRouter = () => {
  const router = new Router();

  router.use(configureUsersRouter());
  router.use(configureListRouter());
  router.use(configureTodosRouter());
  router.use(configureAuthRouter());

  return [router.routes(), router.allowedMethods()];
};
