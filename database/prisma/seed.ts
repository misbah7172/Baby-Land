import bcrypt from 'bcryptjs';

import { PrismaClient, Role, SizeOption } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin12345!', 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@babyland.local' },
    update: { role: Role.ADMIN },
    create: {
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@babyland.local',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phone: '+8801000000000'
    }
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'baby-clothes' },
      update: {},
      create: { name: 'Baby Clothes', slug: 'baby-clothes' }
    }),
    prisma.category.upsert({
      where: { slug: 'baby-katha-blankets' },
      update: {},
      create: { name: 'Baby Katha & Blankets', slug: 'baby-katha-blankets' }
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories' }
    })
  ]);

  const products = [
    {
      name: 'Organic Cotton Romper Set',
      slug: 'organic-cotton-romper-set',
      description: 'Soft, breathable romper set for newborn comfort.',
      price: '1490.00',
      discountPrice: '1290.00',
      categoryId: categories[0].id,
      stock: 24,
      sku: 'BABY-CL-001',
      material: 'Organic cotton',
      featured: true,
      imageUrl: '/images/romper.svg'
    },
    {
      name: 'Warm Baby Katha Blanket',
      slug: 'warm-baby-katha-blanket',
      description: 'Lightweight katha blanket designed for all-season layering.',
      price: '1890.00',
      discountPrice: null,
      categoryId: categories[1].id,
      stock: 18,
      sku: 'BABY-KB-001',
      material: 'Cotton blend',
      featured: true,
      imageUrl: '/images/blanket.svg'
    },
    {
      name: 'Feeding Bib 3-Pack',
      slug: 'feeding-bib-3-pack',
      description: 'Easy-clean bib set for daily feeding time.',
      price: '690.00',
      discountPrice: '590.00',
      categoryId: categories[2].id,
      stock: 55,
      sku: 'BABY-AC-001',
      material: 'Waterproof cotton',
      featured: false,
      imageUrl: '/images/bib.svg'
    }
  ] as const;

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        categoryId: product.categoryId,
        stock: product.stock,
        sku: product.sku,
        material: product.material,
        featured: product.featured
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        categoryId: product.categoryId,
        stock: product.stock,
        sku: product.sku,
        material: product.material,
        featured: product.featured,
        images: { create: [{ url: product.imageUrl, sortOrder: 0 }] },
        sizes: {
          create: [SizeOption.NEWBORN, SizeOption.M0_3, SizeOption.M3_6].map(size => ({ size }))
        }
      }
    });

    if ((await prisma.productImage.count({ where: { productId: created.id } })) === 0) {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: product.imageUrl,
          sortOrder: 0
        }
      });
    }
  }

  console.log(`Seeded admin ${admin.email}, categories, and products.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });