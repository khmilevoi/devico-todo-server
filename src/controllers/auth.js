import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { User } from '../models/user';

const getUserByLogin = (login) => User.findOne({ where: { login } });

export const encrypt = (data, salt = process.env.SALT) => bcrypt.hash(data, salt);
const createToken = (login, id) => jsonwebtoken.sign(
  { data: { login, id }, exp: Date.now() / 1000 + 60 * 60 },
  process.env.SECRET,
  {
    algorithm: 'HS256',
  },
);

const auth = {
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
      return ctx.resolve({ token, login, id });
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

      return ctx.resolve({ token, login, id: user.id });
    }

    return ctx.unauthorized({ message: 'Bad password' });
  },
};

export default auth;
