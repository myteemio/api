import mongoose from 'mongoose';

if (!process.env.DB_CONNECTION_STRING) {
  throw new Error('No DB_CONNECTION_STRING set!');
}
export default await mongoose.connect(process.env.DB_CONNECTION_STRING);

console.log('-> Connected to Database!');
