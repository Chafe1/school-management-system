const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management';
  
  try {
    // Try connecting to primary MONGO_URI with short timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[MongoDB] Standard connection to ${uri} failed: ${primaryErr.message}`);
    console.log('[MongoDB] Attempting in-memory MongoDB fallback (mongodb-memory-server)...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to In-Memory MongoDB at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] Could not start In-Memory MongoDB: ${memErr.message}`);
      throw new Error(`Failed to connect to MongoDB: ${primaryErr.message}`);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('[MongoDB] Error during disconnect:', err.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
