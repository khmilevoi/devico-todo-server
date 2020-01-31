import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export const UserModel = {
  login: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
};

const User = sequelize.define('user', UserModel, {
  freezeTableName: true,
  tableName: 'users',
});

export default User;
