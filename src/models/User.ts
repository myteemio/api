import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false }, // Optional field
  phone: { type: String, required: false }, // Optional field
});

export type User = mongoose.InferSchemaType<typeof userSchema>;
export const User = mongoose.model('User', userSchema);
