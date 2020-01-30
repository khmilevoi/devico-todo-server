// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const RoleSchema = new Schema({
//   owner: { type: String, required: true },
//   list: { type: String, required: true },
//   type: { type: String, enum: ['creator', 'guest'], required: true },
// });

// const Role = mongoose.model('Role', RoleSchema);

// export default Role;

import { DataTypes } from 'sequelize';
import { sequelize, createTable } from '../configureDB';

const RoleModel = {
  owner: { type: DataTypes.STRING, allowNull: false },
  list: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('creator', 'guest'), allowNull: false },
};

createTable('roles', RoleModel);

const Role = sequelize.define('role', RoleModel, {
  freezeTableName: true,
  tableName: 'roles',
});

export default Role;
