import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  login: { type: String },
  password: { type: String },
  token: { type: String },
});

const User = mongoose.model('User', UserSchema);

export default User;
