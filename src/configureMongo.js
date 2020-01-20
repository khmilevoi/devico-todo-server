import mongoose from 'mongoose';

export const configureMongo = () => {
  const connString = 'mongodb://localhost/todo';

  mongoose.connect(connString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  });

  const db = mongoose.connection;

  db.once('open', () => {
    console.log(`Open to ${connString}`);
  });

  db.on('error', (err) => {
    console.log(err);
  });
};
