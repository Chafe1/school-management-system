require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const seedDatabase = require('./src/utils/seedData');

const DEFAULT_PORT = Number(process.env.PORT) || 5000;
let databaseReady = false;

const ensureDatabase = async () => {
  if (databaseReady) return;
  await connectDB();
  await seedDatabase();
  databaseReady = true;
};

const startServer = async (port = DEFAULT_PORT) => {
  try {
    await ensureDatabase();

    const server = app.listen(port, () => {
      console.log(`=======================================================`);
      console.log(`🏫 School Management API running on http://localhost:${port}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 API Base: http://localhost:${port}/api/v1`);
      console.log(`=======================================================`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.warn(`[Server] Port ${port} is busy. Retrying on http://localhost:${nextPort}`);
        startServer(nextPort);
        return;
      }

      console.error('Failed to start server:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
