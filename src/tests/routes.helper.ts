import mongoose from 'mongoose';
import { User } from '../models/User';
import { app } from '..';
import { Activity, ActivityDocument } from '../models/Activity';
import { mockActivities, mockTeemios, mockUsers } from '../util/testData';
import { MyTeemio, MyTeemioDocument } from '../models/MyTeemio';
import MongoMemoryServer from 'mongodb-memory-server-core';

let mongodbConn: MongoMemoryServer; // Your MongoDB connection string

const baseURI = `http://localhost:${process.env.PORT ?? 3001}`;

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

export async function getActivities() {
  const req = new Request(`${baseURI}/api/activities`);
  const res = await app.handle(req);
  const body = (await res.json()) as { activities: Activity[] };
  return body;
}

export async function getActivityByIdOrUrl(idOrUrl: string) {
  const req = new Request(`${baseURI}/api/activities/${idOrUrl}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const res = await app.handle(req);
  const body = (await res.json()) as ActivityDocument | { message: string; error_code: string };
  return body;
}

export async function getRandomActvityId() {
  //Gets the id of the beach-yoga-retreat activity for testing
  const req = new Request(`${baseURI}/api/myteemio/activities/beach-yoga-retreat`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const res = await app.handle(req);
  const body = (await res.json()) as ActivityDocument;
  return body.id;
}

export async function getToken() {
  const req = new Request(`${baseURI}/api/auth/signin/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: 'test@test.com' }),
  });
  const res = await app.handle(req);
  const body = await res.json();
  return body.token;
}

export async function getTeemioById(id: string) {
  const req = new Request(`${baseURI}/api/myteemio/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const res = await app.handle(req);
  const body = (await res.json()) as MyTeemioDocument | { message: string; error_code: string };
  return body;
}

export async function getRandomTeemioIdToDelete() {
  //Gets the id of the cultural-day teemio for testing
  const req = new Request(`${baseURI}/api/myteemio/cultural-day`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const res = await app.handle(req);
  const body = (await res.json()) as MyTeemioDocument;
  return body.id;
}

export async function getRandomTeemioIdToUpdate() {
  //Gets the id of the culinary-exploration teemio for testing
  const req = new Request(`${baseURI}/api/myteemio/culinary-exploration`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const res = await app.handle(req);
  const body = (await res.json()) as MyTeemioDocument;
  return body.id;
}

export async function getRandomTeemioIdToUpdate2() {
  //Gets the id of the cunderwater-diving-expedition teemio for testing
  //TODO: Very scuffed to have two...
  const req = new Request(`${baseURI}/api/myteemio/wellness-weekend`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const res = await app.handle(req);
  const body = (await res.json()) as MyTeemioDocument;
  return body.id;
}

