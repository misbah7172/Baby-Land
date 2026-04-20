import Redis from 'ioredis';

import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined;
}

export const redis = global.redisClient ?? new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  enableReadyCheck: true
});

if (process.env.NODE_ENV !== 'production') {
  global.redisClient = redis;
}

export async function connectRedis() {
  if (redis.status === 'wait' || redis.status === 'end') {
    try {
      await redis.connect();
    } catch {
      return null;
    }
  }

  return redis;
}