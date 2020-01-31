import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export const RoleModel = {
  owner: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: 'users',
    referenceKey: 'id',
    primaryKey: true,
  },
  list: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: 'lists',
    referenceKey: 'id',
    primaryKey: true,
  },
  type: { type: DataTypes.ENUM('creator', 'guest'), allowNull: false },
};

const Role = sequelize.define('role', RoleModel, {
  freezeTableName: true,
  tableName: 'roles',
});

export default Role;
