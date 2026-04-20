import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env } from './lib/env';
import { errorHandler, notFoundHandler } from './middleware/error';
import { adminRouter } from './routes/admin.routes';
import { authRouter } from './routes/auth.routes';
import { cartRouter } from './routes/cart.routes';
import { categoryRouter } from './routes/category.routes';
import { orderRouter } from './routes/order.routes';
import { settingsRouter } from './routes/settings.routes';
import { uploadRouter } from './routes/upload.routes';
import { productRouter } from './routes/product.routes';
import { reviewRouter } from './routes/review.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'backend/public/uploads')));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'baby-land-api' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/upload', uploadRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}