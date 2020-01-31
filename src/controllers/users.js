import { User } from '../models/user';

const tanimoto = (a, b) => {
  const subTokenLength = 3;
  const thresholdWord = 0.7;

  let c = 0;

  const usedTokens = Array(
    Math.min(a.length, b.length, Math.abs(b.length - subTokenLength + 1)),
  );

  for (let i = 0; i < a.length - subTokenLength + 1; ++i) {
    const first = a.substring(i, subTokenLength);

    for (let j = 0; j < b.length - subTokenLength + 1; ++j) {
      if (!usedTokens[j]) {
        const second = b.substring(j, subTokenLength);

        if (first === second) {
          c += 1;
          usedTokens[j] = true;
          break;
        }
      }
    }
  }

  const subTokenFirstCount = a.length - subTokenLength + 1;
  const subTokenSecondCount = b.length - subTokenLength + 1;

  const tanimoto = c / (subTokenFirstCount + subTokenSecondCount - c);

  return [tanimoto, tanimoto >= thresholdWord];
};

const selectUsers = (login) => new Promise((resolve) => {
  const users = [];

  const cursor = User.find().cursor();

  cursor.on('data', (current) => {
    const user = current;

    const currentLogin = user.login.toLowerCase();

    const [coefficient, match] = tanimoto(login, currentLogin);
    user._doc.coefficient = coefficient;

    if (currentLogin.includes(login) || match) {
      users.push(current);
    }
  });

  cursor.on('close', () => resolve(users));
});

const users = {
  get: async (ctx) => {
    const { login } = ctx.query;

    const users = await selectUsers(login.toLowerCase());

    ctx.resolve({ users });
  },
};

export default users;
