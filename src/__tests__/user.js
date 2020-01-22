import mongoose from 'mongoose';

import UserModel from '../models/user';

describe('User model test', () => {
  beforeAll(async () => {
    await mongoose.connect(
      global.__MONGO_URI__,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
      },
      (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
      },
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('create & save user successfully', async () => {
    const validUser = new UserModel({ login: 'Lol', password: '123456' });
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.login).toBe('Lol');
    expect(savedUser.password).toBe('123456');
  });

  it('create user without required field should failed', async () => {
    const userWithoutRequiredField = new UserModel({ login: 'Lol' });
    let error;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      error = savedUserWithoutRequiredField;
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.password).toBeDefined();
  });
});
