import { redis } from '../lib/redis';

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const payload = await redis.get(key);
  return payload ? (JSON.parse(payload) as T) : null;
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds = 300) {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function deleteByPattern(pattern: string) {
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } while (cursor !== '0');
}