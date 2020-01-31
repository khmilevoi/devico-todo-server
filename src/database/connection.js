import { Sequelize } from 'sequelize';

import { TableGenerator } from '../tableGenerator/tableGenerator';

export const sequelize = new Sequelize('todo', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

export const tableGenerator = new TableGenerator(sequelize);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });