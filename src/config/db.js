import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export const connectDB = async (uri = config.mongoUri) => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri);
    isConnected = true;
    if (config.nodeEnv !== 'test') {
      console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    }
    return conn.connection;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (config.nodeEnv !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
  }
};
