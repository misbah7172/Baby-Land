import { Router } from 'express';

import { getSettingsGroup } from '../services/site-settings';

export const settingsRouter = Router();

settingsRouter.get('/homepage', async (_request, response, next) => {
  try {
    const settings = await getSettingsGroup('homepage');
    response.json({ settings });
  } catch (error) {
    next(error);
  }
});