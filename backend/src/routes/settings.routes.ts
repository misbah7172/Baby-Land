import { Router } from 'express';

import { getSettingsGroup } from '../services/site-settings';
import { getCachedJson, setCachedJson } from '../utils/cache';

export const settingsRouter = Router();

settingsRouter.get('/homepage', async (_request, response, next) => {
  try {
    const cacheKey = 'settings:homepage';
    const cached = await getCachedJson<{ settings: Record<string, unknown> }>(cacheKey);
    if (cached) {
      response.setHeader('x-cache', 'HIT');
      response.json(cached);
      return;
    }

    const settings = await getSettingsGroup('homepage');
    const payload = { settings };
    await setCachedJson(cacheKey, payload, 300);

    response.setHeader('x-cache', 'MISS');
    response.json(payload);
  } catch (error) {
    next(error);
  }
});