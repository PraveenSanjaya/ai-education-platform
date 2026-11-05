import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from './app.js';

let mongod: MongoMemoryServer;

export async function startTestDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function stopTestDb() {
  await mongoose.disconnect();
  await mongod.stop();
}

export async function clearDb() {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

export const app = createApp();

export async function registerUser(email = 'learner@example.com', extra: object = {}) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test Learner', email, password: 'password123', ...extra });
  return { token: res.body.token as string, user: res.body.user, res };
}

/** Register a user and promote them to admin directly in the DB. */
export async function registerAdmin(email = 'admin@example.com') {
  const { User } = await import('./models/User.js');
  const r = await registerUser(email);
  await User.updateOne({ email }, { role: 'admin' });
  return r;
}
