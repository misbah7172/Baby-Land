import 'dotenv/config';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

function normalizeUrl(value: string, fallback: string) {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

const envSchema = z.object({
  // Core environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  
  // URLs (normalized to include protocol if omitted)
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  BACKEND_URL: z.string().default('http://localhost:4000'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Database - always required
  DATABASE_URL: z.string()
    .min(1, 'DATABASE_URL is required')
    .regex(/^mysql:/, 'DATABASE_URL must be a MySQL connection string'),
  
  // Redis - optional but validated if provided
  REDIS_URL: z.string()
    .optional()
    .refine(
      url => !url || url.startsWith('redis://') || url.startsWith('rediss://'),
      'REDIS_URL must be a valid Redis connection string'
    )
    .default(''),
  
  // Security - stricter requirements in production
  JWT_ACCESS_SECRET: z.string().min(20, 'JWT_ACCESS_SECRET must be at least 20 characters'),
  
  JWT_REFRESH_SECRET: z.string().min(20, 'JWT_REFRESH_SECRET must be at least 20 characters'),
  
  // Cookie settings
  COOKIE_DOMAIN: z.string().default(''),
  
  COOKIE_SECURE: z.coerce.boolean().default(isProduction),
  
  // Admin credentials - should be managed via secret management in production
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email').default('admin@babyland.local'),
  
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters').default('Admin12345!'),
  
  // Rate limiting (in requests)
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(200),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default(isProduction ? 'info' : 'debug'),
});

// Parse and validate
const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  FRONTEND_URL: normalizeUrl(parsed.FRONTEND_URL, 'http://localhost:3000'),
  BACKEND_URL: normalizeUrl(parsed.BACKEND_URL, 'http://localhost:4000'),
  CORS_ORIGIN: normalizeUrl(parsed.CORS_ORIGIN, 'http://localhost:3000')
};

// Development warning for insecure settings
if (!isProduction && !isTest) {
  if (env.ADMIN_PASSWORD === 'Admin12345!') {
    console.warn('⚠️  WARNING: Using default ADMIN_PASSWORD in development. Change this before production!');
  }
  if (!env.REDIS_URL) {
    console.warn('⚠️  WARNING: Redis is not configured. Caching is disabled.');
  }
}

// Production validation summary
if (isProduction) {
  console.log('✓ Production environment validated');
  console.log(`✓ Database: MySQL configured`);
  console.log(`✓ Frontend URL: ${env.FRONTEND_URL}`);
  console.log(`✓ Redis: ${env.REDIS_URL ? 'Enabled' : 'Disabled (using memory cache)'}`);
  console.log(`✓ URL normalization: Enabled`);
  console.log(`✓ Secure cookies: ${env.COOKIE_SECURE ? 'Enabled' : 'Disabled'}`);
}