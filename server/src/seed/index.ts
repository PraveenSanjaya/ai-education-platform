import mongoose from 'mongoose';
import { connectDb } from '../db.js';
import { seedAdmin } from './admin.js';
import { seedDictionary } from './dictionary.js';

async function main() {
  await connectDb();
  await seedAdmin();
  await seedDictionary();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
