import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({ url: REDIS_URL });
  
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  
  await redisClient.connect();
  
  return redisClient;
}

export const DECREMENT_STOCK_SCRIPT = `
  local key = KEYS[1]
  local decr = tonumber(ARGV[1])
  local stock = tonumber(redis.call('GET', key))
  
  if not stock then
    return -1
  end
  
  if stock < decr then
    return -2
  end
  
  redis.call('DECRBY', key, decr)
  return redis.call('GET', key)
`;