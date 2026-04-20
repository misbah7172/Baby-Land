import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env } from './lib/env';
import { redis, redisHealthCheck } from './lib/redis';
import { errorHandler, notFoundHandler } from './middleware/error';
import { adminRouter } from './routes/admin.routes';
import { authRouter } from './routes/auth.routes';
import { cartRouter } from './routes/cart.routes';
import { categoryRouter } from './routes/category.routes';
import { orderRouter } from './routes/order.routes';
import { settingsRouter } from './routes/settings.routes';
import { productImagesRouter } from './routes/product-images.routes';
import { uploadRouter } from './routes/upload.routes';
import { productRouter } from './routes/product.routes';
import { reviewRouter } from './routes/review.routes';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' },
    xssFilter: true,
  }));

  // CORS configuration
  const corsOptions = {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-admin-email',
      'x-admin-password',
      'x-request-id'
    ],
    maxAge: 86400, // 24 hours
  };
  app.use(cors(corsOptions));

  // Rate limiting - configurable per environment
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      return req.path === '/health';
    }
  });

  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later',
    skip: (req) => req.method !== 'POST'
  });

  // Body parsing with size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '500kb' }));
  app.use(cookieParser());

  // Request ID middleware (for tracing)
  app.use((req, _res, next) => {
    req.id = req.headers['x-request-id'] as string || `${Date.now()}-${Math.random()}`;
    next();
  });

  // Logging middleware (development)
  if (process.env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
      console.log(`[${req.id}] ${req.method} ${req.path}`);
      next();
    });
  }

  // Static files for uploads
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'backend/public/uploads')));

  // Health check endpoint (no rate limiting)
  app.get('/health', async (_req, res) => {
    const redisHealthy = await redisHealthCheck();

    res.json({
      ok: true,
      service: 'baby-land-api',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      redis: {
        configured: Boolean(env.REDIS_URL),
        connected: redis.status === 'ready',
        healthy: redisHealthy,
        status: redis.status
      }
    });
  });

  // Apply rate limiting globally
  app.use(limiter);

  // Apply stricter auth rate limiting
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/refresh', authLimiter);

  // Routes
  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/product-images', productImagesRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/upload', uploadRouter);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Express type augmentation for request ID
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
