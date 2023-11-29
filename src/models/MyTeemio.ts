import mongoose, { Schema } from 'mongoose';
import { User } from './User';

// Define MyTeemioDates Schema
const myTeemioDatesSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now(), required: true },
  votes: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true,
      },
      name: { type: String, required: true },
    },
  ], // Assuming votes are user IDs
});

//Timeslot schema
const timeslotSchema = new mongoose.Schema({
  from: { type: Date, default: new Date().setHours(12, 30), required: true },
  to: { type: Date, default: new Date().setHours(14, 30), required: true },
});

//Eventinfo schema
const eventInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  logo: { type: String, required: true },
});

//Final schema
const finalSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  activity: {
    type: mongoose.Schema.Types.Mixed, // For string | Partial<Activity>
    required: true,
  },
});

// Define MyTeemioActivity Schema
const myTeemioActivitySchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.Types.Mixed, // For string | Partial<Activity>
    required: true,
  },
  timeslot: {
    type: timeslotSchema,
    required: true,
  },
  votes: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true,
      },
      name: { type: String, required: true },
    },
  ], // Assuming votes are user IDs
});

// Define MyTeemio Schema
const myTeemioSchema = new mongoose.Schema({
  id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
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
    type: eventInfoSchema,
    required: true,
  },
  dates: [myTeemioDatesSchema],
  final: {
    type: finalSchema,
    required: true,
  },
});

// Create the model from the schema
export type MyTeemio = mongoose.InferSchemaType<typeof myTeemioSchema>;
export const MyTeemio = mongoose.model('MyTeemio', myTeemioSchema);
