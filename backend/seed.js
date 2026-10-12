require('dotenv').config();
const { connectDB, disconnectDB } = require('./src/config/db');
const seedDatabase = require('./src/utils/seedData');

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('[Seed] Standalone seed run completed.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Standalone seed failed:', err);
    process.exit(1);
  }
};

run();
