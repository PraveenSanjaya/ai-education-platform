import mongoose from 'mongoose';
import { connectDb } from '../db.js';
import { seedAdmin } from './admin.js';

async function main() {
  await connectDb();
  await seedAdmin();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
