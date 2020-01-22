import mongoose from 'mongoose';

import RoleModel from '../models/role';

describe('Role model test', () => {
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

  it('create & save role successfully', async () => {
    const validRole = new RoleModel({
      owner: '123',
      list: '123',
      type: 'creator',
    });
    const savedRole = await validRole.save();

    expect(savedRole._id).toBeDefined();
    expect(savedRole.owner).toBe('123');
    expect(savedRole.list).toBe('123');
    expect(savedRole.type).toBe('creator');
  });

  it('create role without required field should failed', async () => {
    const userWithoutRequiredField = new RoleModel({ owner: 'Lol' });
    let error;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      error = savedUserWithoutRequiredField;
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.list).toBeDefined();
    expect(error.errors.type).toBeDefined();
  });

  it('create role with invalid type field should failed', async () => {
    const userWithoutRequiredField = new RoleModel({
      owner: 'Lol',
      list: '123',
      type: 'a',
    });
    let error;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      error = savedUserWithoutRequiredField;
    } catch (err) {
      error = err;
    }

    expect(error.errors.type).toBeDefined();
  });
});
