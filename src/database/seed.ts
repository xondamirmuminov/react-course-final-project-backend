import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { seedListings } from './seed-data/listings.data';

async function seed() {
  const mongoUri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/apartment-booking';

  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection failed.');
  }

  await Promise.all([
    db.collection('users').deleteMany({}),
    db.collection('listings').deleteMany({}),
    db.collection('favorites').deleteMany({}),
    db.collection('bookings').deleteMany({}),
  ]);

  const demoPasswordHash = await bcrypt.hash('password123', 10);
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await db.collection('users').insertMany([
    {
      name: 'Demo User',
      email: 'demo@example.com',
      password: demoPasswordHash,
      createdAt: new Date(),
    },
    {
      name: 'Admin User',
      email: adminEmail.toLowerCase(),
      password: adminPasswordHash,
      createdAt: new Date(),
    },
  ]);

  await db.collection('listings').insertMany(
    seedListings.map((listing) => ({
      ...listing,
      createdAt: new Date(),
    })),
  );

  console.log('Database seeded successfully.');
  console.log(`Created ${seedListings.length} listings.`);
  console.log('Demo user: demo@example.com / password123');
  console.log(`Admin user: ${adminEmail} / ${adminPassword}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
