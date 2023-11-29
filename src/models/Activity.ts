import mongoose, { Schema } from 'mongoose';

const ActivityScheme = new mongoose.Schema({
  id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  pris: {
    type: Number,
    required: true,
  },
  persons: {
    type: Number,
    required: true,
  },
  category: [
    {
      type: String,
      required: true,
    },
  ],
  address: {
    required: true,
    type: {
      address1: {
        type: String,
        required: true,
      },
      address2: {
        type: String,
        required: false,
      },
      zipcode: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
  },
  referralLink: {
    type: String,
    required: true,
  }, // Referral link to where they can book the activity
  location: {
    // For easier distance calculation
    type: {
      lat: {
        type: Number,
        required: true,
      },
      long: {
        type: Number,
        required: true,
      },
    },
    required: true,
  },
  estimatedHours: {
    type: Number,
    required: true,
    default: 2,
  }, // The amount of hours we estimate the activity to take up
});

export type Activity = mongoose.InferSchemaType<typeof ActivityScheme>;
export const Activity = mongoose.model('Activity', ActivityScheme);
