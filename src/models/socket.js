// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const SocketSchema = new Schema({
//   user: { type: String, required: true },
//   socket: { type: String, required: true },
// });

// const Socket = mongoose.model('Socket', SocketSchema);

// export default Socket;

import { DataTypes } from 'sequelize';
import { sequelize } from '../configureDB';

const SocketModel = {
  user: { type: DataTypes.STRING, allowNull: false },
  socket: { type: DataTypes.STRING, allowNull: false },
};

const Socket = sequelize.define('socket', SocketModel, {
  freezeTableName: true,
  tableName: 'sockets',
});

export default Socket;
