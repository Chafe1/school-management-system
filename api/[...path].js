const app = require('../backend/src/app');
const User = require('../backend/src/models/User');
const { connectDB } = require('../backend/src/config/db');

let databaseInitialization;

const initializeDatabase = async () => {
  if (!databaseInitialization) {
    databaseInitialization = (async () => {
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is required in the Vercel environment.');
      }

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required in the Vercel environment.');
      }

      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to provision the initial administrator.');
      }

      await connectDB();

      const existingAdmin = await User.exists({ role: 'admin' });
      if (!existingAdmin) {
        try {
          await User.create({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin',
            firstName: process.env.ADMIN_FIRST_NAME || 'School',
            lastName: process.env.ADMIN_LAST_NAME || 'Administrator'
          });
        } catch (error) {
          if (error.code !== 11000 || !(await User.exists({ role: 'admin' }))) {
            throw error;
          }
        }
      }
    })();
  }

  try {
    await databaseInitialization;
  } catch (error) {
    databaseInitialization = undefined;
    throw error;
  }
};

module.exports = async (req, res) => {
  try {
    await initializeDatabase();
    return app(req, res);
  } catch (error) {
    console.error('[Vercel API] Database initialization failed:', error.message);
    return res.status(503).json({
      success: false,
      message: 'API is not ready. Check the Vercel database and environment configuration.'
    });
  }
};
