import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPhone = '01000000000';
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      phone: adminPhone,
      name: 'Admin',
      email: 'admin@shatably.com',
      role: 'admin',
      type: 'homeowner',
    },
  });
  console.log(`✅ Admin user created: ${admin.phone}`);

  // Create categories
  const categoriesData = [
    { nameAr: 'مواد هيكلية', nameEn: 'Structural Materials', slug: 'structural', icon: '🏗️',
      children: [
        { nameAr: 'أسمنت', nameEn: 'Cement', slug: 'cement' },
        { nameAr: 'حديد', nameEn: 'Steel', slug: 'steel' },
        { nameAr: 'طوب', nameEn: 'Bricks', slug: 'bricks' },
        { nameAr: 'رمل وزلط', nameEn: 'Sand & Gravel', slug: 'sand-gravel' },
      ],
    },
    { nameAr: 'تشطيبات', nameEn: 'Finishing Materials', slug: 'finishing', icon: '🎨',
      children: [
        { nameAr: 'بلاط وسيراميك', nameEn: 'Tiles & Ceramics', slug: 'tiles' },
        { nameAr: 'دهانات', nameEn: 'Paints', slug: 'paints' },
        { nameAr: 'جبس', nameEn: 'Gypsum', slug: 'gypsum' },
      ],
    },
    { nameAr: 'سباكة', nameEn: 'Plumbing', slug: 'plumbing', icon: '🚿',
      children: [
        { nameAr: 'مواسير', nameEn: 'Pipes', slug: 'pipes' },
        { nameAr: 'خلاطات', nameEn: 'Faucets', slug: 'faucets' },
        { nameAr: 'أدوات صحية', nameEn: 'Sanitary Ware', slug: 'sanitary' },
      ],
    },
    { nameAr: 'كهرباء', nameEn: 'Electrical', slug: 'electrical', icon: '💡',
      children: [
        { nameAr: 'أسلاك', nameEn: 'Wiring', slug: 'wiring' },
        { nameAr: 'مفاتيح وبرايز', nameEn: 'Switches', slug: 'switches' },
        { nameAr: 'إضاءة', nameEn: 'Lighting', slug: 'lighting' },
      ],
    },
    { nameAr: 'عدد وأدوات', nameEn: 'Tools & Hardware', slug: 'tools', icon: '🔧',
      children: [
        { nameAr: 'عدد يدوية', nameEn: 'Hand Tools', slug: 'hand-tools' },
        { nameAr: 'عدد كهربائية', nameEn: 'Power Tools', slug: 'power-tools' },
      ],
    },
    { nameAr: 'أبواب ونوافذ', nameEn: 'Doors & Windows', slug: 'doors-windows', icon: '🚪' },
  ];

  for (const cat of categoriesData) {
    const { children, ...parentData } = cat;
    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: parentData,
      create: { ...parentData, isActive: true },
    });
    console.log(`✅ Category: ${parent.nameEn}`);

    if (children) {
      for (const child of children) {
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: { ...child, parentId: parent.id },
          create: { ...child, parentId: parent.id, isActive: true },
        });
      }
    }
  }

  // Create brands
  const brandsData = [
    { nameAr: 'أسمنت العربي', nameEn: 'Arab Cement', slug: 'arab-cement' },
    { nameAr: 'أسمنت سيناء', nameEn: 'Sinai Cement', slug: 'sinai-cement' },
    { nameAr: 'حديد عز', nameEn: 'Ezz Steel', slug: 'ezz-steel' },
    { nameAr: 'كليوباترا', nameEn: 'Cleopatra', slug: 'cleopatra' },
    { nameAr: 'جوتن', nameEn: 'Jotun', slug: 'jotun' },
    { nameAr: 'سكيب', nameEn: 'Scib', slug: 'scib' },
    { nameAr: 'السويدي', nameEn: 'El Sewedy', slug: 'el-sewedy' },
    { nameAr: 'بوش', nameEn: 'Bosch', slug: 'bosch' },
  ];

  for (const brand of brandsData) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: { ...brand, isActive: true },
    });
  }
  console.log(`✅ ${brandsData.length} brands created`);

  // Get category and brand IDs
  const cementCat = await prisma.category.findUnique({ where: { slug: 'cement' } });
  const steelCat = await prisma.category.findUnique({ where: { slug: 'steel' } });
  const tilesCat = await prisma.category.findUnique({ where: { slug: 'tiles' } });
  const paintsCat = await prisma.category.findUnique({ where: { slug: 'paints' } });

  const arabCement = await prisma.brand.findUnique({ where: { slug: 'arab-cement' } });
  const ezzSteel = await prisma.brand.findUnique({ where: { slug: 'ezz-steel' } });
  const cleopatra = await prisma.brand.findUnique({ where: { slug: 'cleopatra' } });
  const jotun = await prisma.brand.findUnique({ where: { slug: 'jotun' } });

  // Create products
  const productsData = [
    {
      sku: 'CEM-001', nameAr: 'أسمنت العربي بورتلاند', nameEn: 'Arab Portland Cement',
      descriptionAr: 'أسمنت بورتلاند عالي الجودة للأعمال الإنشائية',
      descriptionEn: 'High quality Portland cement for construction works',
      price: 95, unit: 'bag', stock: 500, categoryId: cementCat?.id, brandId: arabCement?.id,
      isFeatured: true, minOrderQty: 10, weight: 50,
    },
    {
      sku: 'STL-001', nameAr: 'حديد عز 12 مم', nameEn: 'Ezz Steel Rebar 12mm',
      descriptionAr: 'حديد تسليح عالي المقاومة',
      descriptionEn: 'High tensile steel rebar',
      price: 42500, unit: 'ton', stock: 50, categoryId: steelCat?.id, brandId: ezzSteel?.id,
      isFeatured: true, minOrderQty: 1, weight: 1000,
    },
    {
      sku: 'TIL-001', nameAr: 'بلاط كليوباترا 60x60', nameEn: 'Cleopatra Tiles 60x60',
      descriptionAr: 'بلاط بورسلين لامع عالي الجودة',
      descriptionEn: 'High quality glossy porcelain tiles',
      price: 185, originalPrice: 220, unit: 'box', stock: 200, categoryId: tilesCat?.id, brandId: cleopatra?.id,
      isFeatured: true, minOrderQty: 5,
    },
    {
      sku: 'PNT-001', nameAr: 'دهان جوتن فينوماستيك', nameEn: 'Jotun Fenomastic Paint',
      descriptionAr: 'دهان داخلي فاخر قابل للغسيل',
      descriptionEn: 'Premium washable interior paint',
      price: 1450, unit: 'piece', stock: 100, categoryId: paintsCat?.id, brandId: jotun?.id,
      isFeatured: true, minOrderQty: 1,
    },
  ];

  for (const product of productsData) {
    if (product.categoryId) {
      const created = await prisma.product.upsert({
        where: { sku: product.sku },
        update: product,
        create: { ...product, isActive: true },
      });

      // Add placeholder image
      await prisma.productImage.upsert({
        where: { id: `${created.id}-img` },
        update: {},
        create: {
          id: `${created.id}-img`,
          productId: created.id,
          url: `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(product.nameEn)}`,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }
  }
  console.log(`✅ ${productsData.length} products created`);

  // Create a promo code
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minOrderAmount: 500,
      maxDiscount: 200,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });
  console.log('✅ Promo code WELCOME10 created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
