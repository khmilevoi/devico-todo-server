import mongoose from 'mongoose';

import SocketModel from '../models/socket';

describe('Socket model test', () => {
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

  it('create & save socket successfully', async () => {
    const validSocket = new SocketModel({
      user: '123',
      socket: '123',
    });
    const savedRole = await validSocket.save();

    expect(savedRole._id).toBeDefined();
    expect(savedRole.user).toBe('123');
    expect(savedRole.socket).toBe('123');
  });

  it('create socket without required field should failed', async () => {
    const userWithoutRequiredField = new SocketModel({ user: 'Lol' });
    let error;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      error = savedUserWithoutRequiredField;
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.socket).toBeDefined();
  });
});
