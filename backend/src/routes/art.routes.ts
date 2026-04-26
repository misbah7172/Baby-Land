import { Router } from 'express';

import { prisma } from '../lib/prisma';

export const artRouter = Router();

// Get all portfolio entries (public)
artRouter.get('/portfolio', async (req, res) => {
  try {
    const portfolio = await prisma.artPortfolio.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

// Get all practical khata entries (public)
artRouter.get('/practical-khata', async (_req, res) => {
  try {
    const entries = await prisma.practicalKhata.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    res.json(entries);
  } catch (error) {
    console.error('Error fetching practical khata entries:', error);
    res.status(500).json({ message: 'Failed to fetch practical khata entries' });
  }
});
