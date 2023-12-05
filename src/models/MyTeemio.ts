import mongoose, { Document } from 'mongoose';
import { User } from './User';

// Define MyTeemioDates Schema
const myTeemioDatesSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now(), required: true },
  votes: [mongoose.Schema.Types.Mixed], // Assuming votes are either UserID's or names
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
  url: {type: String, required: true}
});

//Final schema
const finalSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  activities: {
    type: [mongoose.Schema.Types.Mixed], // For string | Partial<Activity>
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
        type: String,
        ref: User,
        required: true,
      },
      name: { type: String, required: true },
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
    type: String,
    //Cant make put work with user:ref
    required: true,
  },
  eventinfo: {
    type: eventInfoSchema,
    required: true,
  },
  dates: [myTeemioDatesSchema],
  final: {
    type: finalSchema,
    required: false,
  },
});

// Create the model from the schema
export type MyTeemio = mongoose.InferSchemaType<typeof myTeemioSchema>;
export type MyTeemioDocument = MyTeemio & Document;
export const MyTeemio = mongoose.model('MyTeemio', myTeemioSchema);
