import mongoose from 'mongoose';

const { Schema } = mongoose;

const RoleSchema = new Schema({
  owner: { type: String, required: true },
  list: { type: String, required: true },
  type: { type: String, enum: ['creator', 'guest'], required: true },
});

const Role = mongoose.model('Role', RoleSchema);

export default Role;
