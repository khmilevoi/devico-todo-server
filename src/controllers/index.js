import Router from 'koa-router';

import todosController from './todos';
import authController from './auth';

const configureTodosRouter = () => {
  const router = new Router({ prefix: '/todos' });

  router.get('/', todosController.list);
  router.get('/:id', todosController.todo);
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

export default function configureRouter() {
  const router = new Router();

  router.use(configureTodosRouter());
  router.use(configureAuthRouter());

  return [router.routes(), router.allowedMethods()];
}
