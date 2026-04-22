import { prisma } from '../lib/prisma';
import { deleteByPattern } from '../utils/cache';

type EntityState = {
  count: number;
  maxUpdatedAt: string | null;
};

type CacheSnapshot = {
  products: EntityState;
  categories: EntityState;
  reviews: EntityState;
  settings: EntityState;
};

function sameState(a: EntityState, b: EntityState) {
  return a.count === b.count && a.maxUpdatedAt === b.maxUpdatedAt;
}

async function readSnapshot(): Promise<CacheSnapshot> {
  const [
    productCount,
    productMax,
    categoryCount,
    categoryMax,
    reviewCount,
    reviewMax,
    settingCount,
    settingMax
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.aggregate({ _max: { updatedAt: true } }),
    prisma.category.count(),
    prisma.category.aggregate({ _max: { updatedAt: true } }),
    prisma.review.count(),
    prisma.review.aggregate({ _max: { updatedAt: true } }),
    prisma.siteSetting.count(),
    prisma.siteSetting.aggregate({ _max: { updatedAt: true } })
  ]);

  return {
    products: {
      count: productCount,
      maxUpdatedAt: productMax._max.updatedAt?.toISOString() ?? null
    },
    categories: {
      count: categoryCount,
      maxUpdatedAt: categoryMax._max.updatedAt?.toISOString() ?? null
    },
    reviews: {
      count: reviewCount,
      maxUpdatedAt: reviewMax._max.updatedAt?.toISOString() ?? null
    },
    settings: {
      count: settingCount,
      maxUpdatedAt: settingMax._max.updatedAt?.toISOString() ?? null
    }
  };
}

export function startCacheSync(intervalMs = 30000) {
  let active = true;
  let previousSnapshot: CacheSnapshot | null = null;

  const tick = async () => {
    if (!active) {
      return;
    }

    try {
      const snapshot = await readSnapshot();

      if (previousSnapshot) {
        const tasks: Array<Promise<void>> = [];

        if (!sameState(previousSnapshot.products, snapshot.products)) {
          tasks.push(deleteByPattern('products:*'));
        }

        if (!sameState(previousSnapshot.categories, snapshot.categories)) {
          tasks.push(deleteByPattern('categories:*'));
        }

        if (!sameState(previousSnapshot.reviews, snapshot.reviews)) {
          tasks.push(deleteByPattern('reviews:*'));
          tasks.push(deleteByPattern('products:*'));
        }

        if (!sameState(previousSnapshot.settings, snapshot.settings)) {
          tasks.push(deleteByPattern('settings:*'));
        }

        if (tasks.length > 0) {
          await Promise.all(tasks);
        }
      }

      previousSnapshot = snapshot;
    } catch (error) {
      console.warn('Cache sync tick failed:', error instanceof Error ? error.message : error);
    }
  };

  void tick();
  const timer = setInterval(() => {
    void tick();
  }, intervalMs);

  return () => {
    active = false;
    clearInterval(timer);
  };
}
