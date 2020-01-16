import mongoose from 'mongoose';

const { Schema } = mongoose;

const ListSchema = new Schema({
  name: { type: String, required: true },
  public: { type: Boolean, default: false },
  creator: { type: String, required: true },
});

const List = mongoose.model('List', ListSchema);

export default List;
