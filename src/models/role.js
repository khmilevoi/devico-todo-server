import mongoose from 'mongoose';

const { Schema } = mongoose;

const RoleSchema = new Schema({
  owner: { type: String },
  list: { type: String },
  type: { type: String, enum: ['creator', 'guest'] },
});

const Role = mongoose.model('Role', RoleSchema);

export default Role;
