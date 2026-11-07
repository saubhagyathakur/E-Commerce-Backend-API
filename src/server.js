import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`  E-Commerce Backend Server running on port ${config.port}`);
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log(`  Swagger UI: http://localhost:${config.port}/api-docs`);
      console.log(`  Health Check: http://localhost:${config.port}/health`);
      console.log(`=======================================================`);
    });

    const handleExit = (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleExit('SIGTERM'));
    process.on('SIGINT', () => handleExit('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
