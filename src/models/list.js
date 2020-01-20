import mongoose from 'mongoose';

const { Schema } = mongoose;

const ListSchema = new Schema({
  name: { type: String, required: true },
  public: { type: Boolean, default: false },
  creator: { type: String, required: true },
  head: { type: String, default: null },
  tail: { type: String, default: null },
});

const List = mongoose.model('List', ListSchema);

export default List;
