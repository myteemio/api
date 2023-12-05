import mongoose from 'mongoose';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { mockActivities, mockTeemios, mockUsers } from '../util/testData';
import { MyTeemio } from '../models/MyTeemio';
import MongoMemoryServer from 'mongodb-memory-server-core';

let mongodbConn: MongoMemoryServer; // Your MongoDB connection string

export async function setupInMemoryDatabase() {
  console.log('Setting up!');
  const mongod = await MongoMemoryServer.create();
  mongodbConn = mongod;
  await mongoose.connect(mongodbConn.getUri()); // Connect to the DB
}

export async function seedDatabase() {
  console.log('Seeding database........');
  if (mongodbConn) {
    try {
      await insertMockUsers();
      await insertMockActivities();
      await insertMockTeemios();
    } catch (error) {
      console.log("Couldn't seed database", error);
    }
  }
}

export async function insertMockActivities() {
  if (mongodbConn) {
    try {
      return await Activity.insertMany(mockActivities);
    } catch (error) {
      console.log("Couldn't insert mock activities", error);
    }
  }
}

export async function insertMockUsers() {
  if (mongodbConn) {
    try {
      return await User.insertMany(mockUsers);
    } catch (error) {
      console.log("Couldn't insert mock users", error);
    }
  }
}

export async function insertMockTeemios() {
  if (mongodbConn) {
    try {
      return await MyTeemio.insertMany(mockTeemios);
    } catch (error) {
      console.log("Couldn't insert mock Teemios", error);
    }
  }
}
