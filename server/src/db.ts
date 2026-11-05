import mongoose from 'mongoose';
import { config } from './config.js';

export async function connectDb(uri: string = config.mongoUri) {
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
