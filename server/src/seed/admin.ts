import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

/** Create the admin account from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist. */
export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin seed');
    return;
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin ${email} already exists`);
    return;
  }
  await User.create({
    name: 'Administrator',
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'admin',
    startLevel: 'Intermediate',
  });
  console.log(`Admin ${email} created`);
}
