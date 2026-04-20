import Redis from 'ioredis';

import { env } from './env';

type RedisLike = Pick<Redis, 'get' | 'set' | 'del' | 'scan' | 'connect'> & {
  status: Redis['status'];
};

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined;
}

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

export const redis: RedisLike = env.REDIS_URL
  ? (global.redisClient ?? new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true
    }))
  : noopRedis;

if (process.env.NODE_ENV !== 'production' && env.REDIS_URL) {
  global.redisClient = redis;
}

export async function connectRedis() {
  if (!env.REDIS_URL) {
    return null;
  }

  if (redis.status === 'wait' || redis.status === 'end') {
    try {
      await redis.connect();
    } catch {
      return null;
    }
  }

  return redis;
}