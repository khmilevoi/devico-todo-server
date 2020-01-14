import mongoose from 'mongoose';

const { Schema } = mongoose;

const SocketSchema = new Schema({
  user: { type: String },
  socket: { type: String },
});

const Socket = mongoose.model('Socket', SocketSchema);

export default Socket;
