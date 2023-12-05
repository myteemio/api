import mongoose from 'mongoose';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { mockActivities, mockTeemios, mockUsers } from '../util/testData';
import { MyTeemio } from '../models/MyTeemio';

const uri = process.env.DB_CONNECTION_STRING; // Your MongoDB connection string

export async function seedDatabase() {
  console.log('Seeding database........');
  if (uri) {
    try {
      await insertMockUsers();
      await insertMockActivities();
      await insertMockTeemios();
    } catch (error) {
      console.log("Couldn't seed database", error);
    }
  }
}

export async function dropDatabase() {
  if (uri) {
    try {
      const db = await mongoose.connect(uri);
      await db.connection.db.dropCollection('users');
      await db.connection.db.dropCollection('activities');
      await db.connection.db.dropCollection('myteemios');
    } catch (error) {
      console.log("Couldn't drop database", error);
    }
  }
}

export async function insertMockActivities() {
  if (uri) {
    try {
      return await Activity.insertMany(mockActivities);
    } catch (error) {
      console.log("Couldn't insert mock activities", error);
    }
  }
}

export async function insertMockUsers() {
  if (uri) {
    try {
      return await User.insertMany(mockUsers);
    } catch (error) {
      console.log("Couldn't insert mock users", error);
    }
  }
}

export async function insertMockTeemios() {
  if (uri) {
    try {
      return await MyTeemio.insertMany(mockTeemios);
    } catch (error) {
      console.log("Couldn't insert mock Teemios", error);
    }
  }
}
