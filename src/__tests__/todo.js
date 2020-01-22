import mongoose from 'mongoose';

import TodoModel from '../models/todo';

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

  it('create & save todo successfully', async () => {
    const validTodo = new TodoModel({
      inner: '123',
      list: '123',
    });
    const savedTodo = await validTodo.save();

    expect(savedTodo._id).toBeDefined();
    expect(savedTodo.inner).toBe('123');
    expect(savedTodo.list).toBe('123');
    expect(savedTodo.completed).toBe(false);
    expect(savedTodo.next).toBe(null);
  });

  it('create todo without required field should failed', async () => {
    const userWithoutRequiredField = new TodoModel({ inner: 'Lol' });

    let error;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      error = savedUserWithoutRequiredField;
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.list).toBeDefined();
  });
});
