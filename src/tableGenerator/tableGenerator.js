export const tableGenerator = (connection) => {
  const item = (str) => `${str} `;

  return (name, columns) => {
    let query = `CREATE TABLE IF NOT EXISTS ${name} (`;

    query += `${name}_id INT AUTO_INCREMENT PRIMARY KEY,`;

    Object.keys(columns).forEach((name, index, array) => {
      const params = columns[name];

      const type = params.type.toString();

      console.log(params.type);

      query += item(name);
      // query += item(type);

      if (!params.allowNull) {
        query += item('NOT NULL');
      }

      if (params.defaultValue) {
        query += item(`DEFAULT ${params.defaultValue}`);
      }

      if (index !== array.length - 1) {
        query += item(',');
      }
    });

    query += ')  ENGINE=INNODB;';

    console.log(query);

    // return connection.query(query);
  };
};
