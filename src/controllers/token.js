import { createToken, createRefreshToken } from '../utils/refresh';

import { Token } from '../models/token';

const token = {
  updateSession: async (ctx) => {
    const { body } = ctx.request;
    const { refreshToken } = body;

    const { login, id: userId } = ctx.tokenData;

    const token = await Token.findOne({
      where: { token: refreshToken },
    });

    if (token) {
      const newToken = createToken(login, userId);

      return ctx.resolve({ token: newToken });
    }

    return ctx.unauthorized({ message: 'Unauthorized' });
  },
  updateRefresh: async (ctx) => {
    const { body } = ctx.request;
    const { refreshToken } = body;

    const token = await Token.findOne({ where: { token: refreshToken } });

    if (token) {
      const newToken = createRefreshToken();

      await Token.create({
        token: newToken,
        user: token.user,
        socket: token.socket,
      });
      await Token.destroy({ where: { token: refreshToken } });

      return ctx.resolve({ token: newToken });
    }
  },
};

export default token;
