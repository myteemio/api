import mongoose, { Document } from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true, required: false }, // Optional field
  phone: { type: String, required: false }, // Optional field
  type: { type: String, required: true, default: 'user' },
});

export type User = mongoose.InferSchemaType<typeof userSchema>;
export type UserDocument = User & Document;
export const User = mongoose.model('User', userSchema);
