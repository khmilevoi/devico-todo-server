import { User } from './user';
import { List } from './list';
import { Role } from './role';

export const createReferences = () => {
  Role.belongsTo(List, { foreignKey: 'list', as: 'lists' });
  Role.belongsTo(User, { foreignKey: 'owner', as: 'roles' });

  List.hasMany(Role, { foreignKey: 'list', as: 'lists' });
  User.hasOne(Role, { foreignKey: 'owner', as: 'roles' });
};
