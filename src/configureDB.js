import { Sequelize } from 'sequelize';
import { dbGenerator } from './dbGenerator/dbGenerator';

export const sequelize = new Sequelize('todo', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

export const createTable = dbGenerator(sequelize);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
