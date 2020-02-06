import {
  createToken,
  createRefreshToken,
  LIVE_REFRESH_TOKEN,
} from '../utils/refresh';

import { Token } from '../models/token';

const token = {
  updateSession: async (ctx) => {
    const { body } = ctx.request;
    const { refreshToken } = body;

    const { login, id: userId } = ctx.tokenData;

    const refresh = await Token.findOne({
      where: { token: refreshToken },
    });

    if (refresh) {
      const newToken = createToken(login, userId);

      return ctx.resolve({ token: newToken });
    }

    return ctx.unauthorized({ message: 'Unauthorized' });
  },
  updateRefresh: async (ctx) => {
    const { body } = ctx.request;
    const { refreshToken } = body;

    const refresh = await Token.findOne({ where: { token: refreshToken } });

    if (refresh) {
      const newToken = createRefreshToken();

      await Token.create({
        token: newToken,
        user: refresh.user,
        socket: refresh.socket,
      });

      setTimeout(async () => {
        await Token.destroy({ where: { token: newToken } });
      }, LIVE_REFRESH_TOKEN);

      await Token.destroy({ where: { token: refreshToken } });

      return ctx.resolve({ token: newToken, live: LIVE_REFRESH_TOKEN });
    }

    return ctx.unauthorized({ message: 'Unauthorized' });
  },
};

export default token;
