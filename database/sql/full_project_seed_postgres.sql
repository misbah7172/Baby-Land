-- Seed data for ArtSoul By Nishita on PostgreSQL / Supabase
-- Run this after the schema file.

BEGIN;

INSERT INTO "User" (
  "id", "name", "email", "passwordHash", "role", "phone", "createdAt", "updatedAt"
) VALUES (
  'user-admin-baby-land',
  'Admin',
  'admin@babyland.local',
  '$2b$12$WzKUmjcKHW54Z3NjnmXZ8O3rkRwm9g7uv/bTF3EJ.pLz6sNyGntYy',
  'ADMIN',
  '+8801000000000',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "passwordHash" = EXCLUDED."passwordHash",
  "role" = EXCLUDED."role",
  "phone" = EXCLUDED."phone",
  "updatedAt" = NOW();

INSERT INTO "Category" (
  "id", "name", "slug", "createdAt", "updatedAt"
) VALUES
  ('category-baby-clothes', 'Baby Clothes', 'baby-clothes', NOW(), NOW()),
  ('category-baby-katha-blankets', 'Baby Katha & Blankets', 'baby-katha-blankets', NOW(), NOW()),
  ('category-accessories', 'Accessories', 'accessories', NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "updatedAt" = NOW();

INSERT INTO "Product" (
  "id", "name", "slug", "description", "price", "discountPrice", "categoryId", "stock", "sku", "material", "featured", "createdAt", "updatedAt"
) VALUES
  (
    'product-organic-cotton-romper-set',
    'Organic Cotton Romper Set',
    'organic-cotton-romper-set',
    'Soft, breathable romper set for newborn comfort.',
    1490.00,
    1290.00,
    'category-baby-clothes',
    24,
    'BABY-CL-001',
    'Organic cotton',
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'product-warm-baby-katha-blanket',
    'Warm Baby Katha Blanket',
    'warm-baby-katha-blanket',
    'Lightweight katha blanket designed for all-season layering.',
    1890.00,
    NULL,
    'category-baby-katha-blankets',
    18,
    'BABY-KB-001',
    'Cotton blend',
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'product-feeding-bib-3-pack',
    'Feeding Bib 3-Pack',
    'feeding-bib-3-pack',
    'Easy-clean bib set for daily feeding time.',
    690.00,
    590.00,
    'category-accessories',
    55,
    'BABY-AC-001',
    'Waterproof cotton',
    FALSE,
    NOW(),
    NOW()
  )
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "price" = EXCLUDED."price",
  "discountPrice" = EXCLUDED."discountPrice",
  "categoryId" = EXCLUDED."categoryId",
  "stock" = EXCLUDED."stock",
  "sku" = EXCLUDED."sku",
  "material" = EXCLUDED."material",
  "featured" = EXCLUDED."featured",
  "updatedAt" = NOW();

INSERT INTO "ProductImage" (
  "id", "productId", "url", "sortOrder"
) VALUES
  ('image-romper-1', 'product-organic-cotton-romper-set', '/images/romper.svg', 0),
  ('image-blanket-1', 'product-warm-baby-katha-blanket', '/images/blanket.svg', 0),
  ('image-bib-1', 'product-feeding-bib-3-pack', '/images/bib.svg', 0)
ON CONFLICT ("id") DO UPDATE SET
  "productId" = EXCLUDED."productId",
  "url" = EXCLUDED."url",
  "sortOrder" = EXCLUDED."sortOrder";

INSERT INTO "ProductSizeOption" (
  "id", "productId", "size"
) VALUES
  ('size-romper-newborn', 'product-organic-cotton-romper-set', 'NEWBORN'),
  ('size-romper-m0_3', 'product-organic-cotton-romper-set', 'M0_3'),
  ('size-romper-m3_6', 'product-organic-cotton-romper-set', 'M3_6'),
  ('size-blanket-newborn', 'product-warm-baby-katha-blanket', 'NEWBORN'),
  ('size-blanket-m0_3', 'product-warm-baby-katha-blanket', 'M0_3'),
  ('size-blanket-m3_6', 'product-warm-baby-katha-blanket', 'M3_6'),
  ('size-bib-newborn', 'product-feeding-bib-3-pack', 'NEWBORN'),
  ('size-bib-m0_3', 'product-feeding-bib-3-pack', 'M0_3'),
  ('size-bib-m3_6', 'product-feeding-bib-3-pack', 'M3_6')
ON CONFLICT ("productId", "size") DO UPDATE SET
  "productId" = EXCLUDED."productId",
  "size" = EXCLUDED."size";

INSERT INTO "SiteSetting" (
  "id", "group", "key", "value", "createdAt", "updatedAt"
) VALUES
  ('setting-homepage-heroBadge', 'homepage', 'heroBadge', 'Comfort for Your Little One', NOW(), NOW()),
  ('setting-homepage-heroTitle', 'homepage', 'heroTitle', 'Gentle Care, Trusted Quality', NOW(), NOW()),
  ('setting-homepage-heroSubtitle', 'homepage', 'heroSubtitle', 'Premium baby essentials designed with parents in mind. Soft, safe, and sourced from the most trusted brands for your peace of mind.', NOW(), NOW()),
  ('setting-homepage-primaryCtaLabel', 'homepage', 'primaryCtaLabel', 'Explore Products', NOW(), NOW()),
  ('setting-homepage-secondaryCtaLabel', 'homepage', 'secondaryCtaLabel', 'View Categories', NOW(), NOW())
ON CONFLICT ("group", "key") DO UPDATE SET
  "value" = EXCLUDED."value",
  "updatedAt" = NOW();

COMMIT;
