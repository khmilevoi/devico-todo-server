import mongoose from 'mongoose';

const { Schema } = mongoose;

const ListSchema = new Schema({
  name: { type: String },
  public: { type: Boolean, default: false },
});

const List = mongoose.model('List', ListSchema);

export default List;
