import { getRedisClient } from './redis';
import { NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private keyPrefix: string;

  constructor(keyPrefix: string, config: RateLimitConfig) {
    this.keyPrefix = keyPrefix;
    this.config = config;
  }

  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const redis = await getRedisClient();
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    await redis.zRemRangeByScore(key, 0, windowStart);

    const requestCount = await redis.zCard(key);

    if (requestCount >= this.config.maxRequests) {
      const oldestRequest = await redis.zRange(key, 0, 0, { REV: false });
      const resetTime = oldestRequest.length > 0 
        ? parseInt(oldestRequest[0]) + this.config.windowMs
        : now + this.config.windowMs;

      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    await redis.zAdd(key, { score: now, value: `${now}` });
    await redis.expire(key, Math.ceil(this.config.windowMs / 1000));

    return {
      allowed: true,
      remaining: this.config.maxRequests - requestCount - 1,
      resetTime: now + this.config.windowMs,
    };
  }

  static async middleware(
    identifier: string,
    limiterType: 'purchase' | 'general'
  ): Promise<NextResponse | null> {
    const config = limiterType === 'purchase'
      ? { windowMs: 60000, maxRequests: 5 }
      : { windowMs: 60000, maxRequests: 10 };

    const limiter = new RateLimiter(`ratelimit:${limiterType}`, config);
    const result = await limiter.checkLimit(identifier);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, message: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          }
        }
      );
    }

    return null;
  }
}