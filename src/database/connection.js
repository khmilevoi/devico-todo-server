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

// sequelize.query(`
//   drop procedure if exists createList;

//   create procedure createList(in head int, in amount int)
//   begin
//       declare currentItem int default head;
//       declare counter int default 0;

//       drop table if exists items;
//       create temporary table items(id int, text varchar(255), list int, next int, completed tinyint, created_at datetime, updated_at datetime);

//       while !isnull(currentItem) and counter < amount do
//           if !isnull(currentItem) then
//         insert into items select * from todos where todos.id = currentItem;
//         set counter = counter + 1;
//       end if;

//       select next into currentItem from todos where todos.id = currentItem;
//     end while;

//       select * from items;
//   end;
// `);
