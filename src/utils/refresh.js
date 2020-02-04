import jsonwebtoken from 'jsonwebtoken';
import randtoken from 'rand-token';

export const LIVE_SESSION_TOKEN = 15000 || process.env.LIVE_SESSION_TOKEN;
export const LIVE_REFRESH_TOKEN = LIVE_SESSION_TOKEN * 3 || process.env.LIVE_REFRESH_TOKEN;

export const createToken = (login, id) => jsonwebtoken.sign(
  { data: { login, id }, exp: Date.now() / 1000 + LIVE_SESSION_TOKEN / 1000 },
  process.env.SECRET,
  {
    algorithm: 'HS256',
  },
);

export const createRefreshToken = () => randtoken.uid(255);
