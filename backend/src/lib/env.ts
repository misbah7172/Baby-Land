import 'dotenv/config';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const envSchema = z.object({
  // Core environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  
  // URLs - require HTTPS in production
  FRONTEND_URL: z.string()
    .url('Invalid FRONTEND_URL format')
    .refine(
      url => !isProduction || url.startsWith('https://'),
      'FRONTEND_URL must use HTTPS in production'
    )
    .default('http://localhost:3000'),
  
  BACKEND_URL: z.string()
    .url('Invalid BACKEND_URL format')
    .refine(
      url => !isProduction || url.startsWith('https://'),
      'BACKEND_URL must use HTTPS in production'
    )
    .default('http://localhost:4000'),
  
  CORS_ORIGIN: z.string()
    .default('http://localhost:3000')
    .refine(
      origin => !isProduction || origin.startsWith('https://'),
      'CORS_ORIGIN must use HTTPS in production'
    ),
  
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
  JWT_ACCESS_SECRET: z.string()
    .min(isProduction ? 32 : 20, `JWT_ACCESS_SECRET must be at least ${isProduction ? 32 : 20} characters`)
    .refine(
      secret => !isProduction || /[A-Z]/.test(secret) && /[0-9]/.test(secret) && /[^A-Za-z0-9]/.test(secret),
      'JWT_ACCESS_SECRET must contain uppercase, numbers, and special characters in production'
    ),
  
  JWT_REFRESH_SECRET: z.string()
    .min(isProduction ? 32 : 20, `JWT_REFRESH_SECRET must be at least ${isProduction ? 32 : 20} characters`)
    .refine(
      secret => !isProduction || /[A-Z]/.test(secret) && /[0-9]/.test(secret) && /[^A-Za-z0-9]/.test(secret),
      'JWT_REFRESH_SECRET must contain uppercase, numbers, and special characters in production'
    ),
  
  // Cookie settings
  COOKIE_DOMAIN: z.string()
    .refine(
      domain => !isProduction || domain !== 'localhost',
      'COOKIE_DOMAIN must not be localhost in production'
    )
    .default('localhost'),
  
  COOKIE_SECURE: z.coerce.boolean()
    .refine(
      secure => !isProduction || secure === true,
      'COOKIE_SECURE must be true in production'
    )
    .default(false),
  
  // Admin credentials - should be managed via secret management in production
  ADMIN_EMAIL: z.string()
    .email('ADMIN_EMAIL must be a valid email')
    .default('admin@babyland.local')
    .refine(
      email => !isProduction || email !== 'admin@babyland.local',
      'ADMIN_EMAIL should be changed from default in production'
    ),
  
  ADMIN_PASSWORD: z.string()
    .min(isProduction ? 12 : 8, `ADMIN_PASSWORD must be at least ${isProduction ? 12 : 8} characters`)
    .refine(
      pass => !isProduction || /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass),
      'ADMIN_PASSWORD must contain uppercase, numbers, and special characters in production'
    )
    .default('Admin12345!')
    .refine(
      pass => !isProduction || pass !== 'Admin12345!',
      'ADMIN_PASSWORD should be changed from default in production'
    ),
  
  // Rate limiting (in requests)
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(200),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default(isProduction ? 'info' : 'debug'),
});

// Parse and validate
export const env = envSchema.parse(process.env);

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
  console.log(`✓ HTTPS enforcement: Enabled`);
  console.log(`✓ Secure cookies: ${env.COOKIE_SECURE ? 'Enabled' : 'Disabled'}`);
}