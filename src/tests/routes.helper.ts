import mongoose from 'mongoose';
import { User } from '../models/User';
import { app } from '..';
import { Activity, ActivityDocument } from '../models/Activity';
import { TESTmockActivities, TESTmockTeemios, TESTmockUsers } from '../util/testData';
import { MyTeemio, MyTeemioDocument } from '../models/MyTeemio';
import MongoMemoryServer from 'mongodb-memory-server-core';
import jwt from 'jsonwebtoken';
import { Static } from 'elysia';
import { MyTeemioStatusEnum } from '../controllers/MyTeemioController';

let mongodbConn: MongoMemoryServer; // Your MongoDB connection string

const baseURI = `http://localhost:${process.env.PORT ?? 3001}`;

export async function TESTsetupInMemoryDatabase() {
  console.log('Setting up!');
  const mongod = await MongoMemoryServer.create();
  mongodbConn = mongod;
  await mongoose.connect(mongodbConn.getUri()); // Connect to the DB
}

export async function TESTseedDatabase() {
  console.log('Seeding database........');
  if (mongodbConn) {
    try {
      await TESTinsertMockUsers();
      await TESTinsertMockActivities();
      await TESTinsertMockTeemios();
    } catch (error) {
      console.log("Couldn't seed database", error);
    }
  }
}

export function TESTcreateAuthToken(userid: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error('No JWT_SECRET configured!');
  }

  return jwt.sign({ id: userid }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export async function TESTinsertMockActivities() {
  if (mongodbConn) {
    try {
      return await Activity.insertMany(TESTmockActivities);
    } catch (error) {
      console.log("Couldn't insert mock activities", error);
    }
  }
}

export async function TESTgetMockUserByEmail(email: string) {
  if (mongodbConn) {
    try {
      return await User.findOne({ email: email });
    } catch (error) {
      console.log('Couldnt find mock use', error);
    }
  }
}

export async function TESTinsertMockUsers() {
  if (mongodbConn) {
    try {
      return await User.insertMany(TESTmockUsers);
    } catch (error) {
      console.log("Couldn't insert mock users", error);
    }
  }
}

export async function TESTinsertMockTeemios() {
  if (mongodbConn) {
    try {
      return await MyTeemio.insertMany(TESTmockTeemios);
    } catch (error) {
      console.log("Couldn't insert mock Teemios", error);
    }
  }
}

export async function TESTgetActivities() {
  if (mongodbConn) {
    return await Activity.find({});
  }
}

export async function TESTgetActivityById(id: string) {
  if (mongodbConn) {
    return await Activity.findById(id);
  }
}

export async function TESTgetTeemioById(id: string) {
  if (mongodbConn) {
    return await MyTeemio.findById(id);
  }
}

export async function TESTgetRandomMyTeemioId(status?: Static<typeof MyTeemioStatusEnum>): Promise<string | undefined> {
  if (mongodbConn) {
    const count = await MyTeemio.countDocuments(status ? { status: status } : {});
    const random = Math.floor(Math.random() * count);

    const myteemio = await MyTeemio.findOne(status ? { status: status } : {})
      .skip(random)
      .exec();
    return myteemio?.id;
  }
}

export async function TESTgetRandomActivityId(): Promise<string | undefined> {
  if (mongodbConn) {
    const count = await Activity.countDocuments();
    const random = Math.floor(Math.random() * count);

    const activity = await Activity.findOne().skip(random).exec();
    return activity?.id;
  }
}
