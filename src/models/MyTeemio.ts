import mongoose, { Schema } from 'mongoose';
import { User } from './User';

// Define MyTeemioDates Schema
const myTeemioDatesSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  ], // Assuming votes are user IDs
});

// Define MyTeemioActivity Schema
const myTeemioActivitySchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.Types.Mixed, // For string | Partial<Activity>
    required: true,
  },
  timeslot: {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
  ], // Assuming votes are user IDs
});

// Define MyTeemio Schema
const myTeemioSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['active', 'locked', 'finalized'],
    required: true,
  },
  activities: [myTeemioActivitySchema],
  organizer: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  eventinfo: {
    name: { type: String, required: true },
    description: { type: String, required: true },
    logo: { type: String, required: true },
  },
  dates: [myTeemioDatesSchema],
  final: {
    date: { type: Date, required: true },
    activity: {
      type: mongoose.Schema.Types.Mixed, // For string | Partial<Activity>
      required: true,
    },
  },
});

// Create the model from the schema
export type MyTeemio = mongoose.InferSchemaType<typeof myTeemioSchema>;
export const MyTeemio = mongoose.model('MyTeemio', myTeemioSchema);
