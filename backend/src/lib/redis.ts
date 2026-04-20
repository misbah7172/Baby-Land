import Redis from 'ioredis';

import { env } from './env';

type RedisLike = Pick<Redis, 'get' | 'set' | 'del' | 'scan' | 'connect'> & {
  status: Redis['status'];
};

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined;
}

/**
 * No-op Redis implementation for when Redis is not configured
 * Provides graceful fallback with null/empty responses
 */
const noopRedis: RedisLike = {
  status: 'end',
  async get() {
    return null;
  },
  async set() {
    return 'OK';
  },
  async del() {
    return 0;
  },
  async scan() {
    return ['0', []];
  },
  async connect() {
    return undefined;
  }
};

/**
 * Redis client initialization with production-grade configuration
 * Includes connection pooling, reconnection strategy, and monitoring
 */
export const redis: RedisLike = env.REDIS_URL
  ? (global.redisClient ?? new Redis(env.REDIS_URL, {
      // Connection pooling
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      lazyConnect: true,
      
      // Reconnection strategy
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        if (times > 10) {
          console.error('Redis reconnection failed after 10 attempts');
          return null; // Stop reconnecting
        }
        return delay;
      },
      
      // Connection timeouts
      connectTimeout: 10000,
      commandTimeout: 5000,
      
      // Keep-alive
      keepAlive: 30000,
      
      // Production settings
      ...(process.env.NODE_ENV === 'production' && {
        tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 100, 5000);
          if (times > 20) {
            console.error('Redis reconnection exhausted');
            return null;
          }
          return delay;
        },
        maxRetriesPerRequest: 5,
      })
    }))
  : noopRedis;

/**
 * Event handlers for monitoring
 */
if (env.REDIS_URL && redis instanceof Redis) {
  redis.on('connect', () => {
    console.log('✓ Redis connected');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  redis.on('close', () => {
    console.warn('⚠️  Redis connection closed');
  });

  redis.on('reconnecting', () => {
    console.log('↻ Redis reconnecting...');
  });
}

/**
 * Initialize Redis connection
 * Should be called during app startup
 */
export async function connectRedis() {
  if (!env.REDIS_URL) {
    console.warn('⚠️  Redis not configured. Cache operations will not persist.');
    return null;
  }

  if (!(redis instanceof Redis)) {
    return redis;
  }

  if (redis.status === 'wait' || redis.status === 'end') {
    try {
      await redis.connect();
      console.log('✓ Redis connection initialized');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  return redis;
}

/**
 * Health check for Redis
 * Returns true if Redis is available and responding
 */
export async function redisHealthCheck(): Promise<boolean> {
  if (!env.REDIS_URL) {
    return true; // No-op is "healthy"
  }

  try {
    if (redis instanceof Redis) {
      await redis.ping();
      return true;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Graceful disconnect
 */
export async function disconnectRedis() {
  if (redis instanceof Redis) {
    try {
      await redis.quit();
      console.log('✓ Redis disconnected gracefully');
    } catch (error) {
      console.error('Error disconnecting Redis:', error);
    }
  }
}

// Store in global for reuse in development
if (process.env.NODE_ENV !== 'production' && redis instanceof Redis) {
  global.redisClient = redis;
}
