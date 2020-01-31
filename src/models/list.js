// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const ListSchema = new Schema({
//   name: { type: String, required: true },
//   public: { type: Boolean, default: false },
//   creator: { type: String, required: true },
//   head: { type: String, default: null },
//   tail: { type: String, default: null },
// });

// const List = mongoose.model('List', ListSchema);

// export default List;

import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export const ListModel = {
  name: { type: DataTypes.STRING, allowNull: false },
  public: { type: DataTypes.BOOLEAN, defaultValue: true },
  creator: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: 'users',
    referenceKey: 'id',
  },
  head: { type: DataTypes.INTEGER, references: 'todos', referenceKey: 'id' },
  tail: { type: DataTypes.INTEGER, references: 'todos', referenceKey: 'id' },
};

const List = sequelize.define('list', ListModel, {
  freezeTableName: true,
  tableName: 'lists',
});

export default List;
