import mongoose from 'mongoose';

const { Schema } = mongoose;

const SocketSchema = new Schema({
  user: { type: String, required: true },
  socket: { type: String, required: true },
});

const Socket = mongoose.model('Socket', SocketSchema);

export default Socket;
