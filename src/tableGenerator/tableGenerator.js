const item = (str) => ` ${str}`;

const types = {
  STRING: 'VARCHAR(255)',
  BOOLEAN: 'BOOLEAN',
  INTEGER: 'INT',
  DATE: 'DATETIME',
};

const createType = (type) => {
  const typeCode = type.key;

  if (typeCode === 'ENUM') {
    const { values } = type;

    const parsedValues = values.map((item) => `'${item}'`);

    return `ENUM(${parsedValues.join(', ')})`;
  }

  return types[typeCode];
};

export class TableGenerator {
  constructor(connection) {
    this.connection = connection;

    this.constraints = {};
  }

  add(tableName, columns) {
    let query = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

    query += 'id INT AUTO_INCREMENT,';

    const primary = ['id'];
    const foreign = {};

    Object.keys(columns).forEach((fieldName, index, array) => {
      const params = columns[fieldName];

      const name = params.field || fieldName;

      query += item(name);

      const typeObject = params.type;
      const type = createType(typeObject);

      query += item(type);

      if (!params.allowNull) {
        query += item('NOT NULL');
      }

      if (params.defaultValue) {
        query += item(`DEFAULT ${params.defaultValue}`);
      }

      if (params.primaryKey) {
        primary.push(name);
      }

      if (params.references && params.referenceKey) {
        foreign[params.references] = foreign[params.references] || [];

        foreign[params.references].push({
          ref: params.referenceKey,
          column: name,
        });
      }

      if (index !== array.length - 1) {
        query += ',\n';
      }
    });

    if (primary.length) {
      query += `, \n${TableGenerator.PRIMARY_KEY(primary)}`;
    }

    query += '\n) ENGINE=INNODB;';

    this.constraints[tableName] = foreign;

    return this.connection.query(query);
  }

  createReferences() {
    Object.entries(this.constraints).forEach(([tableName, foreign]) => {
      Object.entries(foreign).forEach(([table, items]) => items.forEach(({ column, ref }) => {
        const query = TableGenerator.ALTER_TABLE_FK(
          tableName,
          column,
          table,
          ref,
        );

        this.connection
          .query(query)
          .catch(() => console.log(
            `duplicate ${tableName}_${table}_${column}_${ref}_fs constraint in ${tableName}`,
          ));
      }));
    });
  }

  static ALTER_TABLE_FK(table, column, refTable, ref) {
    return `ALTER TABLE ${table} ADD CONSTRAINT ${table}_${refTable}_${column}_${ref}_fk FOREIGN KEY (${column}) REFERENCES ${refTable}(${ref});`;
  }

  static PRIMARY_KEY(columns) {
    return `CONSTRAINT ${columns.join('_')}_pk PRIMARY KEY (${columns.join(
      ', ',
    )})`;
  }
}
