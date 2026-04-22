import { createApp } from './app';
import { env } from './lib/env';
import { connectRedis, disconnectRedis } from './lib/redis';
import { prisma } from './lib/prisma';
import { startCacheSync } from './services/cache-sync';

async function startServer() {
  try {
    // Initialize Redis
    console.log('Initializing Redis...');
    await connectRedis();

    // Test database connection, but do not hard-fail startup if DB is briefly unavailable.
    console.log('Testing database connection...');
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✓ Database connection successful');
    } catch (error) {
      console.warn('⚠️  Database warm-up check failed. Starting server anyway and retrying on requests.');
      console.warn(error instanceof Error ? error.message : error);
    }

    // Create Express app
    const app = createApp();
    const stopCacheSync = startCacheSync();

    // Start listening
    const server = app.listen(env.PORT, () => {
      console.log(`✓ API listening on port ${env.PORT}`);
      console.log(`✓ Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Gracefully shutting down...`);
      
      server.close(async () => {
        console.log('✓ Server closed');
        
        // Cleanup resources
        stopCacheSync();
        await disconnectRedis();
        await prisma.$disconnect();
        
        console.log('✓ Shutdown complete');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
