import bcrypt from 'bcrypt';

import { User } from '../models/user';

import { createToken, LIVE_SESSION_TOKEN } from '../utils/refresh';

import { Token } from '../models/token';

const getUserByLogin = (login) => User.findOne({ where: { login } });

export const encrypt = (data, salt = process.env.SALT) => bcrypt.hash(data, salt);

const auth = {
  check: async (ctx) => {
    const { body } = ctx.request;
    const { refreshToken } = body;

    const refresh = await Token.findOne({ where: { token: refreshToken } });

    if (refresh) {
      const user = await User.findOne({ where: { id: refresh.user } });

      const sessionToken = createToken(user.login, user.id);

      await Token.destroy({ where: { token: refreshToken } });

      return ctx.resolve({
        login: user.login,
        id: user.id,
        live: LIVE_SESSION_TOKEN,
        token: sessionToken,
      });
    }

    return ctx.unauthorized({ message: 'Unauthorized' });
  },
  register: async (ctx) => {
    const { body } = ctx.request;
    let { login, password } = body;
    login = login.trim();
    password = password.trim();

    if (login === '' || password === '') {
      return ctx.forbidden({ message: 'Login or password is empty' });
    }

    const user = await getUserByLogin(login);

    if (!user) {
      const encryptedPassword = await encrypt(password);

      const { id } = await User.create({
        login,
        password: encryptedPassword,
      });

      const token = createToken(login, id);

      return ctx.resolve({
        token,
        login,
        id,
        live: LIVE_SESSION_TOKEN,
      });
    }

    return ctx.badRequest({ message: 'User exist' });
  },
  login: async (ctx) => {
    const { body } = ctx.request;
    let { login, password } = body;
    login = login.trim();
    password = password.trim();

    if (login === '' || password === '') {
      return ctx.forbidden({ message: 'Login or password is empty' });
    }

    const user = await getUserByLogin(login);

    if (!user) {
      return ctx.unauthorized({ message: 'User don`t exist' });
    }

    const check = await bcrypt.compare(password, user.password);

    if (check) {
      const token = createToken(user.login, user.id);

      return ctx.resolve({
        token,
        login,
        id: user.id,
        live: LIVE_SESSION_TOKEN,
      });
    }

    return ctx.unauthorized({ message: 'Bad password' });
  },
};

export default auth;
