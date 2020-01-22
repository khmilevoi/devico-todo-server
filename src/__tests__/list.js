import mongoose from 'mongoose';

import ListModel from '../models/list';

describe('List model test', () => {
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

  it('create & save list successfully', async () => {
    const validList = new ListModel({ name: '123', creator: '123' });
    const savedList = await validList.save();

    expect(savedList._id).toBeDefined();
    expect(savedList.name).toBe('123');
    expect(savedList.creator).toBe('123');
    expect(savedList.public).toBe(false);
    expect(savedList.head).toBe(null);
    expect(savedList.tail).toBe(null);
  });

  it('create list without required field should failed', async () => {
    const userWithoutRequiredField = new ListModel({ name: 'Lol' });
    let error;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      error = savedUserWithoutRequiredField;
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.creator).toBeDefined();
  });
});
