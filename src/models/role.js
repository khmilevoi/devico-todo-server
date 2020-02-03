import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export const RoleModel = {
  owner: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: 'users',
    referenceKey: 'id',
    foreignKey: 'users_owner_id_fk',
    primaryKey: true,
  },
  list: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: 'lists',
    referenceKey: 'id',
    foreignKey: 'lists_list_id_fk',
    primaryKey: true,
  },
  type: { type: DataTypes.ENUM('creator', 'guest'), allowNull: false },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
};

export const Role = sequelize.define('role', RoleModel, {
  freezeTableName: true,
  tableName: 'roles',
});
