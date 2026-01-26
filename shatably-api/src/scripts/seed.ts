import { PrismaClient, ProductUnit, ContentType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Egyptian building materials...');

  // Create super admin user
  const adminPhone = '01000000000';
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { role: 'super_admin', permissions: [] },
    create: {
      phone: adminPhone,
      name: 'مدير النظام',
      email: 'admin@shatably.com',
      role: 'super_admin',
      type: 'homeowner',
      permissions: [],
    },
  });
  console.log(`✅ Super Admin user created: ${admin.phone}`);

  // Create categories
  const categoriesData = [
    {
      nameAr: 'مواد البناء الهيكلية', nameEn: 'Structural Materials', slug: 'structural', icon: '🏗️',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
      children: [
        { nameAr: 'أسمنت', nameEn: 'Cement', slug: 'cement', icon: '🧱' },
        { nameAr: 'حديد التسليح', nameEn: 'Steel Rebar', slug: 'steel', icon: '🔩' },
        { nameAr: 'طوب', nameEn: 'Bricks', slug: 'bricks', icon: '🧱' },
        { nameAr: 'رمل', nameEn: 'Sand', slug: 'sand', icon: '🏖️' },
        { nameAr: 'زلط', nameEn: 'Gravel', slug: 'gravel', icon: '🪨' },
        { nameAr: 'خرسانة جاهزة', nameEn: 'Ready Mix Concrete', slug: 'concrete', icon: '🏗️' },
      ],
    },
    {
      nameAr: 'تشطيبات وديكور', nameEn: 'Finishing & Decor', slug: 'finishing', icon: '🎨',
      image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800',
      children: [
        { nameAr: 'بلاط وسيراميك', nameEn: 'Tiles & Ceramics', slug: 'tiles', icon: '🔲' },
        { nameAr: 'بورسلين', nameEn: 'Porcelain', slug: 'porcelain', icon: '✨' },
        { nameAr: 'رخام وجرانيت', nameEn: 'Marble & Granite', slug: 'marble', icon: '💎' },
        { nameAr: 'دهانات', nameEn: 'Paints', slug: 'paints', icon: '🎨' },
        { nameAr: 'ورق حائط', nameEn: 'Wallpaper', slug: 'wallpaper', icon: '🖼️' },
        { nameAr: 'جبس وأسقف', nameEn: 'Gypsum & Ceilings', slug: 'gypsum', icon: '🏠' },
        { nameAr: 'باركيه وأرضيات', nameEn: 'Flooring', slug: 'flooring', icon: '🪵' },
      ],
    },
    {
      nameAr: 'سباكة ومياه', nameEn: 'Plumbing', slug: 'plumbing', icon: '🚿',
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
      children: [
        { nameAr: 'مواسير PPR', nameEn: 'PPR Pipes', slug: 'ppr-pipes', icon: '🔵' },
        { nameAr: 'مواسير PVC', nameEn: 'PVC Pipes', slug: 'pvc-pipes', icon: '⚪' },
        { nameAr: 'خلاطات ومحابس', nameEn: 'Faucets & Valves', slug: 'faucets', icon: '🚰' },
        { nameAr: 'أطقم حمامات', nameEn: 'Bathroom Sets', slug: 'bathroom', icon: '🛁' },
        { nameAr: 'سخانات مياه', nameEn: 'Water Heaters', slug: 'heaters', icon: '🔥' },
        { nameAr: 'طلمبات مياه', nameEn: 'Water Pumps', slug: 'pumps', icon: '💧' },
        { nameAr: 'خزانات مياه', nameEn: 'Water Tanks', slug: 'tanks', icon: '🛢️' },
      ],
    },
    {
      nameAr: 'كهرباء وإضاءة', nameEn: 'Electrical & Lighting', slug: 'electrical', icon: '💡',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
      children: [
        { nameAr: 'أسلاك وكابلات', nameEn: 'Wires & Cables', slug: 'wiring', icon: '🔌' },
        { nameAr: 'مفاتيح ومقابس', nameEn: 'Switches & Outlets', slug: 'switches', icon: '🔘' },
        { nameAr: 'لوحات توزيع', nameEn: 'Distribution Boards', slug: 'panels', icon: '📟' },
        { nameAr: 'إضاءة LED', nameEn: 'LED Lighting', slug: 'led', icon: '💡' },
        { nameAr: 'نجف وثريات', nameEn: 'Chandeliers', slug: 'chandeliers', icon: '✨' },
        { nameAr: 'إضاءة خارجية', nameEn: 'Outdoor Lighting', slug: 'outdoor-lighting', icon: '🏮' },
      ],
    },
    {
      nameAr: 'عدد وأدوات', nameEn: 'Tools & Hardware', slug: 'tools', icon: '🔧',
      image: 'https://images.unsplash.com/photo-1581147036324-c17ac41f3a1b?w=800',
      children: [
        { nameAr: 'عدد يدوية', nameEn: 'Hand Tools', slug: 'hand-tools', icon: '🔨' },
        { nameAr: 'عدد كهربائية', nameEn: 'Power Tools', slug: 'power-tools', icon: '⚡' },
        { nameAr: 'مسامير وبراغي', nameEn: 'Fasteners', slug: 'fasteners', icon: '🔩' },
        { nameAr: 'معدات سلامة', nameEn: 'Safety Equipment', slug: 'safety', icon: '🦺' },
        { nameAr: 'سلالم وسقالات', nameEn: 'Ladders & Scaffolding', slug: 'ladders', icon: '🪜' },
      ],
    },
    {
      nameAr: 'أبواب ونوافذ', nameEn: 'Doors & Windows', slug: 'doors-windows', icon: '🚪',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      children: [
        { nameAr: 'أبواب خشب', nameEn: 'Wood Doors', slug: 'wood-doors', icon: '🚪' },
        { nameAr: 'أبواب حديد', nameEn: 'Steel Doors', slug: 'steel-doors', icon: '🚪' },
        { nameAr: 'ألوميتال', nameEn: 'Aluminum', slug: 'aluminum', icon: '🪟' },
        { nameAr: 'زجاج', nameEn: 'Glass', slug: 'glass', icon: '🪟' },
        { nameAr: 'كوالين وأكسسوارات', nameEn: 'Locks & Accessories', slug: 'locks', icon: '🔐' },
      ],
    },
    {
      nameAr: 'عوازل وتحضيرات', nameEn: 'Insulation & Preparation', slug: 'insulation', icon: '🛡️',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
      children: [
        { nameAr: 'عوازل مائية', nameEn: 'Waterproofing', slug: 'waterproofing', icon: '💧' },
        { nameAr: 'عوازل حرارية', nameEn: 'Thermal Insulation', slug: 'thermal', icon: '🌡️' },
        { nameAr: 'لاصق وجراوت', nameEn: 'Adhesives & Grout', slug: 'adhesives', icon: '🧴' },
        { nameAr: 'سيلر ومواد تحضير', nameEn: 'Sealers & Primers', slug: 'sealers', icon: '🎨' },
      ],
    },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const { children, ...parentData } = cat;
    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: { ...parentData, isActive: true },
      create: { ...parentData, isActive: true },
    });
    categoryMap[parentData.slug] = parent.id;
    console.log(`✅ Category: ${parent.nameEn}`);

    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const created = await prisma.category.upsert({
          where: { slug: child.slug },
          update: { ...child, parentId: parent.id, sortOrder: i },
          create: { ...child, parentId: parent.id, isActive: true, sortOrder: i },
        });
        categoryMap[child.slug] = created.id;
      }
    }
  }

  // Create brands - Egyptian and International
  const brandsData = [
    // Cement brands
    { nameAr: 'أسمنت العربي', nameEn: 'Arabian Cement', slug: 'arabian-cement', logo: '' },
    { nameAr: 'أسمنت السويس', nameEn: 'Suez Cement', slug: 'suez-cement', logo: '' },
    { nameAr: 'أسمنت سيناء', nameEn: 'Sinai Cement', slug: 'sinai-cement', logo: '' },
    { nameAr: 'أسمنت أسيوط', nameEn: 'Assiut Cement', slug: 'assiut-cement', logo: '' },
    { nameAr: 'لافارج مصر', nameEn: 'Lafarge Egypt', slug: 'lafarge', logo: '' },
    { nameAr: 'تيتان مصر', nameEn: 'Titan Egypt', slug: 'titan', logo: '' },
    // Steel brands
    { nameAr: 'حديد عز', nameEn: 'Ezz Steel', slug: 'ezz-steel', logo: '' },
    { nameAr: 'حديد المصريين', nameEn: 'Al Masryeen Steel', slug: 'masryeen-steel', logo: '' },
    { nameAr: 'حديد بشاي', nameEn: 'Beshay Steel', slug: 'beshay-steel', logo: '' },
    { nameAr: 'حديد السويس', nameEn: 'Suez Steel', slug: 'suez-steel', logo: '' },
    // Tiles & Ceramics brands
    { nameAr: 'كليوباترا', nameEn: 'Cleopatra', slug: 'cleopatra', logo: '' },
    { nameAr: 'الجوهرة', nameEn: 'El Gowhara', slug: 'gowhara', logo: '' },
    { nameAr: 'سيراميكا رويال', nameEn: 'Royal Ceramica', slug: 'royal-ceramica', logo: '' },
    { nameAr: 'سيراميكا الفا', nameEn: 'Alfa Ceramica', slug: 'alfa-ceramica', logo: '' },
    { nameAr: 'سيراميكا فينوس', nameEn: 'Venus Ceramica', slug: 'venus', logo: '' },
    { nameAr: 'ليسيكو', nameEn: 'Lecico', slug: 'lecico', logo: '' },
    // Paints brands
    { nameAr: 'جوتن', nameEn: 'Jotun', slug: 'jotun', logo: '' },
    { nameAr: 'سكيب', nameEn: 'Scib Paints', slug: 'scib', logo: '' },
    { nameAr: 'سايبس', nameEn: 'Sipes', slug: 'sipes', logo: '' },
    { nameAr: 'بكسين', nameEn: 'Pachin', slug: 'pachin', logo: '' },
    { nameAr: 'كيماويات البناء الحديث', nameEn: 'CMB', slug: 'cmb', logo: '' },
    // Electrical brands
    { nameAr: 'السويدي', nameEn: 'El Sewedy', slug: 'elsewedy', logo: '' },
    { nameAr: 'فينوس', nameEn: 'Venus Electric', slug: 'venus-electric', logo: '' },
    { nameAr: 'شنايدر', nameEn: 'Schneider Electric', slug: 'schneider', logo: '' },
    { nameAr: 'لوجرون', nameEn: 'Legrand', slug: 'legrand', logo: '' },
    { nameAr: 'فيليبس', nameEn: 'Philips', slug: 'philips', logo: '' },
    { nameAr: 'أوسرام', nameEn: 'Osram', slug: 'osram', logo: '' },
    // Plumbing brands
    { nameAr: 'إيديال ستاندرد', nameEn: 'Ideal Standard', slug: 'ideal-standard', logo: '' },
    { nameAr: 'ديورافيت', nameEn: 'Duravit', slug: 'duravit', logo: '' },
    { nameAr: 'جروهي', nameEn: 'Grohe', slug: 'grohe', logo: '' },
    { nameAr: 'هانز جروهي', nameEn: 'Hansgrohe', slug: 'hansgrohe', logo: '' },
    { nameAr: 'أكوا ثيرم', nameEn: 'Aquatherm', slug: 'aquatherm', logo: '' },
    // Tools brands
    { nameAr: 'بوش', nameEn: 'Bosch', slug: 'bosch', logo: '' },
    { nameAr: 'ماكيتا', nameEn: 'Makita', slug: 'makita', logo: '' },
    { nameAr: 'ديوالت', nameEn: 'DeWalt', slug: 'dewalt', logo: '' },
    { nameAr: 'ستانلي', nameEn: 'Stanley', slug: 'stanley', logo: '' },
    { nameAr: 'توتال', nameEn: 'Total', slug: 'total', logo: '' },
    // Adhesives & Waterproofing
    { nameAr: 'سافيتو', nameEn: 'Saveto', slug: 'saveto', logo: '' },
    { nameAr: 'سيكا', nameEn: 'Sika', slug: 'sika', logo: '' },
    { nameAr: 'فوسروك', nameEn: 'Fosroc', slug: 'fosroc', logo: '' },
    { nameAr: 'ماركو', nameEn: 'Mapei', slug: 'mapei', logo: '' },
  ];

  const brandMap: Record<string, string> = {};

  for (const brand of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: { ...brand, isActive: true },
    });
    brandMap[brand.slug] = created.id;
  }
  console.log(`✅ ${brandsData.length} brands created`);

  // Create comprehensive products
  const productsData = [
    // CEMENT PRODUCTS
    { sku: 'CEM-ARAB-50', nameAr: 'أسمنت العربي بورتلاندي 50 كجم', nameEn: 'Arabian Portland Cement 50kg', descriptionAr: 'أسمنت بورتلاندي عادي عالي الجودة من شركة العربي للأسمنت.', descriptionEn: 'High quality ordinary Portland cement from Arabian Cement Company.', price: 95, unit: ProductUnit.bag, stock: 1000, categorySlug: 'cement', brandSlug: 'arabian-cement', isFeatured: true, minOrderQty: 10, weight: 50 },
    { sku: 'CEM-SUEZ-50', nameAr: 'أسمنت السويس 50 كجم', nameEn: 'Suez Cement 50kg', descriptionAr: 'أسمنت السويس بورتلاندي عالي الجودة.', descriptionEn: 'High quality Suez Portland cement.', price: 92, unit: ProductUnit.bag, stock: 800, categorySlug: 'cement', brandSlug: 'suez-cement', minOrderQty: 10, weight: 50 },
    { sku: 'CEM-SINAI-50', nameAr: 'أسمنت سيناء 50 كجم', nameEn: 'Sinai Cement 50kg', descriptionAr: 'أسمنت سيناء بورتلاندي عادي للبناء.', descriptionEn: 'Sinai ordinary Portland cement for construction.', price: 90, unit: ProductUnit.bag, stock: 600, categorySlug: 'cement', brandSlug: 'sinai-cement', minOrderQty: 10, weight: 50 },
    { sku: 'CEM-LAFARGE-50', nameAr: 'أسمنت لافارج 50 كجم', nameEn: 'Lafarge Cement 50kg', descriptionAr: 'أسمنت لافارج عالي الجودة مطابق للمواصفات الأوروبية.', descriptionEn: 'High quality Lafarge cement meeting European standards.', price: 98, unit: ProductUnit.bag, stock: 500, categorySlug: 'cement', brandSlug: 'lafarge', isFeatured: true, minOrderQty: 10, weight: 50 },
    { sku: 'CEM-TITAN-WR', nameAr: 'أسمنت تيتان مقاوم للمياه', nameEn: 'Titan Water Resistant Cement', descriptionAr: 'أسمنت مقاوم للمياه والرطوبة.', descriptionEn: 'Water resistant cement.', price: 115, unit: ProductUnit.bag, stock: 300, categorySlug: 'cement', brandSlug: 'titan', minOrderQty: 10, weight: 50 },

    // STEEL PRODUCTS
    { sku: 'STL-EZZ-10', nameAr: 'حديد تسليح عز 10 مم', nameEn: 'Ezz Steel Rebar 10mm', descriptionAr: 'حديد تسليح من إنتاج حديد عز، قطر 10 مم، طول 12 متر.', descriptionEn: 'Reinforcement steel from Ezz Steel, 10mm diameter.', price: 42000, unit: ProductUnit.ton, stock: 200, categorySlug: 'steel', brandSlug: 'ezz-steel', isFeatured: true, minOrderQty: 1, weight: 1000 },
    { sku: 'STL-EZZ-12', nameAr: 'حديد تسليح عز 12 مم', nameEn: 'Ezz Steel Rebar 12mm', descriptionAr: 'حديد تسليح عز قطر 12 مم.', descriptionEn: 'Ezz Steel rebar 12mm diameter.', price: 42500, unit: ProductUnit.ton, stock: 180, categorySlug: 'steel', brandSlug: 'ezz-steel', isFeatured: true, minOrderQty: 1, weight: 1000 },
    { sku: 'STL-EZZ-16', nameAr: 'حديد تسليح عز 16 مم', nameEn: 'Ezz Steel Rebar 16mm', descriptionAr: 'حديد تسليح عز قطر 16 مم.', descriptionEn: 'Ezz Steel rebar 16mm.', price: 43000, unit: ProductUnit.ton, stock: 150, categorySlug: 'steel', brandSlug: 'ezz-steel', minOrderQty: 1, weight: 1000 },
    { sku: 'STL-MASRY-12', nameAr: 'حديد المصريين 12 مم', nameEn: 'Al Masryeen Steel 12mm', descriptionAr: 'حديد تسليح المصريين.', descriptionEn: 'Al Masryeen reinforcement steel.', price: 41500, unit: ProductUnit.ton, stock: 120, categorySlug: 'steel', brandSlug: 'masryeen-steel', minOrderQty: 1, weight: 1000 },
    { sku: 'STL-BESHAY-12', nameAr: 'حديد بشاي 12 مم', nameEn: 'Beshay Steel 12mm', descriptionAr: 'حديد تسليح بشاي.', descriptionEn: 'Beshay reinforcement steel.', price: 41000, unit: ProductUnit.ton, stock: 100, categorySlug: 'steel', brandSlug: 'beshay-steel', minOrderQty: 1, weight: 1000 },

    // BRICKS
    { sku: 'BRK-RED-1000', nameAr: 'طوب أحمر طفلي 1000 طوبة', nameEn: 'Red Clay Bricks (1000 pcs)', descriptionAr: 'طوب أحمر طفلي للبناء. مقاس 25×12×6.5 سم.', descriptionEn: 'Red clay bricks. Size 25x12x6.5 cm.', price: 1800, unit: ProductUnit.piece, stock: 100, categorySlug: 'bricks', isFeatured: true, minOrderQty: 1 },
    { sku: 'BRK-CEMENT-1000', nameAr: 'طوب أسمنتي مفرغ 1000 طوبة', nameEn: 'Hollow Cement Blocks (1000 pcs)', descriptionAr: 'طوب أسمنتي مفرغ للبناء.', descriptionEn: 'Hollow cement blocks for construction.', price: 3500, unit: ProductUnit.piece, stock: 80, categorySlug: 'bricks', minOrderQty: 1 },
    { sku: 'BRK-LIGHT-1000', nameAr: 'طوب خفيف عازل 1000 طوبة', nameEn: 'Lightweight Insulating Blocks', descriptionAr: 'طوب خفيف عازل للحرارة والصوت.', descriptionEn: 'Lightweight blocks with thermal insulation.', price: 5500, unit: ProductUnit.piece, stock: 50, categorySlug: 'bricks', minOrderQty: 1 },

    // SAND & GRAVEL
    { sku: 'SND-FINE-M3', nameAr: 'رمل ناعم (متر مكعب)', nameEn: 'Fine Sand (Cubic Meter)', descriptionAr: 'رمل ناعم نظيف للبناء والمحارة.', descriptionEn: 'Clean fine sand for construction.', price: 350, unit: ProductUnit.cubicmeter, stock: 500, categorySlug: 'sand', minOrderQty: 1 },
    { sku: 'SND-COARSE-M3', nameAr: 'رمل خشن (متر مكعب)', nameEn: 'Coarse Sand (Cubic Meter)', descriptionAr: 'رمل خشن للخرسانة.', descriptionEn: 'Coarse sand for concrete.', price: 320, unit: ProductUnit.cubicmeter, stock: 400, categorySlug: 'sand', minOrderQty: 1 },
    { sku: 'GRV-M3', nameAr: 'زلط (متر مكعب)', nameEn: 'Gravel (Cubic Meter)', descriptionAr: 'زلط نظيف للخرسانة.', descriptionEn: 'Clean gravel for concrete.', price: 450, unit: ProductUnit.cubicmeter, stock: 300, categorySlug: 'gravel', minOrderQty: 1 },

    // TILES & CERAMICS
    { sku: 'TIL-CLEO-60', nameAr: 'سيراميك كليوباترا 60×60', nameEn: 'Cleopatra Ceramic 60x60', descriptionAr: 'سيراميك أرضيات فاخر من كليوباترا. مقاس 60×60 سم.', descriptionEn: 'Premium floor ceramic from Cleopatra. Size 60x60 cm.', price: 185, originalPrice: 220, unit: ProductUnit.box, stock: 500, categorySlug: 'tiles', brandSlug: 'cleopatra', isFeatured: true, minOrderQty: 5 },
    { sku: 'TIL-CLEO-30', nameAr: 'سيراميك كليوباترا حوائط 30×60', nameEn: 'Cleopatra Wall Ceramic 30x60', descriptionAr: 'سيراميك حوائط من كليوباترا.', descriptionEn: 'Wall ceramic from Cleopatra.', price: 145, unit: ProductUnit.box, stock: 400, categorySlug: 'tiles', brandSlug: 'cleopatra', minOrderQty: 5 },
    { sku: 'TIL-ROYAL-60', nameAr: 'بورسلين رويال 60×60', nameEn: 'Royal Porcelain 60x60', descriptionAr: 'بورسلين فاخر من رويال سيراميكا.', descriptionEn: 'Premium porcelain from Royal Ceramica.', price: 250, unit: ProductUnit.box, stock: 300, categorySlug: 'porcelain', brandSlug: 'royal-ceramica', isFeatured: true, minOrderQty: 5 },
    { sku: 'TIL-GOWHARA-80', nameAr: 'بورسلين الجوهرة 80×80', nameEn: 'El Gowhara Porcelain 80x80', descriptionAr: 'بورسلين فاخر كبير الحجم.', descriptionEn: 'Premium large format porcelain.', price: 320, unit: ProductUnit.box, stock: 200, categorySlug: 'porcelain', brandSlug: 'gowhara', minOrderQty: 5 },
    { sku: 'TIL-ALFA-60', nameAr: 'سيراميك ألفا 60×60', nameEn: 'Alfa Ceramic 60x60', descriptionAr: 'سيراميك أرضيات من ألفا.', descriptionEn: 'Floor ceramic from Alfa.', price: 165, unit: ProductUnit.box, stock: 350, categorySlug: 'tiles', brandSlug: 'alfa-ceramica', minOrderQty: 5 },

    // PAINTS
    { sku: 'PNT-JOTUN-18', nameAr: 'دهان جوتن فينوماستيك 18 لتر', nameEn: 'Jotun Fenomastic 18L', descriptionAr: 'دهان داخلي فاخر من جوتن. قابل للغسيل.', descriptionEn: 'Premium interior paint from Jotun. Washable.', price: 1450, unit: ProductUnit.piece, stock: 200, categorySlug: 'paints', brandSlug: 'jotun', isFeatured: true, minOrderQty: 1 },
    { sku: 'PNT-JOTUN-4', nameAr: 'دهان جوتن فينوماستيك 4 لتر', nameEn: 'Jotun Fenomastic 4L', descriptionAr: 'دهان داخلي فاخر من جوتن.', descriptionEn: 'Premium interior paint from Jotun.', price: 450, unit: ProductUnit.piece, stock: 300, categorySlug: 'paints', brandSlug: 'jotun', minOrderQty: 1 },
    { sku: 'PNT-SCIB-18', nameAr: 'دهان سكيب سوبر 18 لتر', nameEn: 'Scib Super Paint 18L', descriptionAr: 'دهان بلاستيك اقتصادي.', descriptionEn: 'Economic plastic paint.', price: 850, unit: ProductUnit.piece, stock: 250, categorySlug: 'paints', brandSlug: 'scib', minOrderQty: 1 },
    { sku: 'PNT-SIPES-18', nameAr: 'دهان سايبس بلاستيك 18 لتر', nameEn: 'Sipes Plastic Paint 18L', descriptionAr: 'دهان بلاستيك عالي الجودة.', descriptionEn: 'High quality plastic paint.', price: 750, unit: ProductUnit.piece, stock: 200, categorySlug: 'paints', brandSlug: 'sipes', minOrderQty: 1 },
    { sku: 'PNT-PACHIN-18', nameAr: 'دهان باكسين اكريليك 18 لتر', nameEn: 'Pachin Acrylic Paint 18L', descriptionAr: 'دهان اكريليك خارجي.', descriptionEn: 'Exterior acrylic paint.', price: 950, unit: ProductUnit.piece, stock: 150, categorySlug: 'paints', brandSlug: 'pachin', minOrderQty: 1 },

    // ELECTRICAL - WIRES
    { sku: 'ELC-SEWEDY-1.5', nameAr: 'سلك السويدي 1.5 مم 100 متر', nameEn: 'El Sewedy Wire 1.5mm 100m', descriptionAr: 'سلك كهرباء نحاس نقي من السويدي.', descriptionEn: 'Pure copper electrical wire from El Sewedy.', price: 1800, unit: ProductUnit.piece, stock: 200, categorySlug: 'wiring', brandSlug: 'elsewedy', isFeatured: true, minOrderQty: 1 },
    { sku: 'ELC-SEWEDY-2.5', nameAr: 'سلك السويدي 2.5 مم 100 متر', nameEn: 'El Sewedy Wire 2.5mm 100m', descriptionAr: 'سلك كهرباء نحاس 2.5 مم².', descriptionEn: 'Copper electrical wire 2.5mm².', price: 2800, unit: ProductUnit.piece, stock: 180, categorySlug: 'wiring', brandSlug: 'elsewedy', isFeatured: true, minOrderQty: 1 },
    { sku: 'ELC-SEWEDY-4', nameAr: 'سلك السويدي 4 مم 100 متر', nameEn: 'El Sewedy Wire 4mm 100m', descriptionAr: 'سلك كهرباء للأحمال العالية.', descriptionEn: 'Copper wire for high loads.', price: 4200, unit: ProductUnit.piece, stock: 120, categorySlug: 'wiring', brandSlug: 'elsewedy', minOrderQty: 1 },
    { sku: 'ELC-SEWEDY-6', nameAr: 'سلك السويدي 6 مم 100 متر', nameEn: 'El Sewedy Wire 6mm 100m', descriptionAr: 'سلك كهرباء للتكييفات.', descriptionEn: 'Copper wire for air conditioners.', price: 6500, unit: ProductUnit.piece, stock: 80, categorySlug: 'wiring', brandSlug: 'elsewedy', minOrderQty: 1 },

    // SWITCHES & OUTLETS
    { sku: 'ELC-SCHN-SW', nameAr: 'مفتاح شنايدر مفرد', nameEn: 'Schneider Single Switch', descriptionAr: 'مفتاح كهرباء مفرد من شنايدر.', descriptionEn: 'Single electrical switch from Schneider.', price: 85, unit: ProductUnit.piece, stock: 500, categorySlug: 'switches', brandSlug: 'schneider', isFeatured: true, minOrderQty: 1 },
    { sku: 'ELC-SCHN-OUT', nameAr: 'بريزة شنايدر مزدوجة', nameEn: 'Schneider Double Outlet', descriptionAr: 'بريزة كهرباء مزدوجة من شنايدر.', descriptionEn: 'Double electrical outlet from Schneider.', price: 120, unit: ProductUnit.piece, stock: 400, categorySlug: 'switches', brandSlug: 'schneider', minOrderQty: 1 },
    { sku: 'ELC-LEGR-SW', nameAr: 'مفتاح لوجرون مفرد', nameEn: 'Legrand Single Switch', descriptionAr: 'مفتاح كهرباء فاخر من لوجرون.', descriptionEn: 'Premium electrical switch from Legrand.', price: 95, unit: ProductUnit.piece, stock: 350, categorySlug: 'switches', brandSlug: 'legrand', minOrderQty: 1 },

    // LIGHTING
    { sku: 'ELC-PHIL-LED9', nameAr: 'لمبة فيليبس LED 9 وات', nameEn: 'Philips LED Bulb 9W', descriptionAr: 'لمبة LED موفرة للطاقة.', descriptionEn: 'Energy saving LED bulb.', price: 35, unit: ProductUnit.piece, stock: 1000, categorySlug: 'led', brandSlug: 'philips', isFeatured: true, minOrderQty: 1 },
    { sku: 'ELC-PHIL-LED12', nameAr: 'لمبة فيليبس LED 12 وات', nameEn: 'Philips LED Bulb 12W', descriptionAr: 'لمبة LED عالية الإضاءة.', descriptionEn: 'High brightness LED bulb.', price: 45, unit: ProductUnit.piece, stock: 800, categorySlug: 'led', brandSlug: 'philips', minOrderQty: 1 },
    { sku: 'ELC-OSRAM-LED9', nameAr: 'لمبة أوسرام LED 9 وات', nameEn: 'Osram LED Bulb 9W', descriptionAr: 'لمبة LED موفرة من أوسرام.', descriptionEn: 'Energy saving LED from Osram.', price: 32, unit: ProductUnit.piece, stock: 600, categorySlug: 'led', brandSlug: 'osram', minOrderQty: 1 },

    // PLUMBING - PIPES
    { sku: 'PLM-PPR-20', nameAr: 'ماسورة PPR 20 مم (4 متر)', nameEn: 'PPR Pipe 20mm (4m)', descriptionAr: 'ماسورة PPR للمياه الساخنة والباردة.', descriptionEn: 'PPR pipe for hot and cold water.', price: 35, unit: ProductUnit.piece, stock: 1000, categorySlug: 'ppr-pipes', brandSlug: 'aquatherm', isFeatured: true, minOrderQty: 10 },
    { sku: 'PLM-PPR-25', nameAr: 'ماسورة PPR 25 مم (4 متر)', nameEn: 'PPR Pipe 25mm (4m)', descriptionAr: 'ماسورة PPR 25 مم.', descriptionEn: 'PPR pipe 25mm.', price: 45, unit: ProductUnit.piece, stock: 800, categorySlug: 'ppr-pipes', brandSlug: 'aquatherm', minOrderQty: 10 },
    { sku: 'PLM-PPR-32', nameAr: 'ماسورة PPR 32 مم (4 متر)', nameEn: 'PPR Pipe 32mm (4m)', descriptionAr: 'ماسورة PPR 32 مم.', descriptionEn: 'PPR pipe 32mm.', price: 65, unit: ProductUnit.piece, stock: 600, categorySlug: 'ppr-pipes', brandSlug: 'aquatherm', minOrderQty: 10 },

    // FAUCETS & BATHROOM
    { sku: 'PLM-GROHE-MIX', nameAr: 'خلاط حوض جروهي', nameEn: 'Grohe Basin Mixer', descriptionAr: 'خلاط حوض فاخر من جروهي الألمانية.', descriptionEn: 'Premium basin mixer from Grohe Germany.', price: 2500, unit: ProductUnit.piece, stock: 50, categorySlug: 'faucets', brandSlug: 'grohe', isFeatured: true, minOrderQty: 1 },
    { sku: 'PLM-IDEAL-SET', nameAr: 'طقم حمام إيديال ستاندرد', nameEn: 'Ideal Standard Bathroom Set', descriptionAr: 'طقم حمام كامل من إيديال ستاندرد.', descriptionEn: 'Complete bathroom set from Ideal Standard.', price: 8500, unit: ProductUnit.piece, stock: 30, categorySlug: 'bathroom', brandSlug: 'ideal-standard', isFeatured: true, minOrderQty: 1 },
    { sku: 'PLM-DURAVIT-WC', nameAr: 'قاعدة ديورافيت معلقة', nameEn: 'Duravit Wall-hung WC', descriptionAr: 'قاعدة حمام معلقة فاخرة.', descriptionEn: 'Premium wall-hung WC.', price: 12000, unit: ProductUnit.piece, stock: 20, categorySlug: 'bathroom', brandSlug: 'duravit', minOrderQty: 1 },

    // POWER TOOLS
    { sku: 'TOL-BOSCH-DRL', nameAr: 'شنيور بوش احترافي 750 وات', nameEn: 'Bosch Pro Drill 750W', descriptionAr: 'شنيور كهربائي احترافي من بوش.', descriptionEn: 'Professional electric drill from Bosch.', price: 2500, originalPrice: 2900, unit: ProductUnit.piece, stock: 40, categorySlug: 'power-tools', brandSlug: 'bosch', isFeatured: true, minOrderQty: 1 },
    { sku: 'TOL-MAKITA-HMR', nameAr: 'هيلتي ماكيتا 800 وات', nameEn: 'Makita Hammer Drill 800W', descriptionAr: 'دريل هيلتي من ماكيتا.', descriptionEn: 'Makita hammer drill.', price: 3200, unit: ProductUnit.piece, stock: 30, categorySlug: 'power-tools', brandSlug: 'makita', minOrderQty: 1 },
    { sku: 'TOL-DEWALT-SAW', nameAr: 'صاروخ ديوالت 125 مم', nameEn: 'DeWalt Angle Grinder 125mm', descriptionAr: 'صاروخ قطع وجلخ من ديوالت.', descriptionEn: 'Angle grinder from DeWalt.', price: 1800, unit: ProductUnit.piece, stock: 50, categorySlug: 'power-tools', brandSlug: 'dewalt', minOrderQty: 1 },
    { sku: 'TOL-TOTAL-DRL', nameAr: 'شنيور توتال 650 وات', nameEn: 'Total Drill 650W', descriptionAr: 'شنيور اقتصادي من توتال.', descriptionEn: 'Economic drill from Total.', price: 850, unit: ProductUnit.piece, stock: 80, categorySlug: 'power-tools', brandSlug: 'total', minOrderQty: 1 },

    // HAND TOOLS
    { sku: 'TOL-STAN-SET', nameAr: 'طقم عدد ستانلي 100 قطعة', nameEn: 'Stanley Tool Set 100 pcs', descriptionAr: 'طقم عدد يدوية شامل من ستانلي.', descriptionEn: 'Comprehensive hand tool set from Stanley.', price: 1500, unit: ProductUnit.piece, stock: 30, categorySlug: 'hand-tools', brandSlug: 'stanley', isFeatured: true, minOrderQty: 1 },
    { sku: 'TOL-STAN-HAM', nameAr: 'شاكوش ستانلي 500 جرام', nameEn: 'Stanley Hammer 500g', descriptionAr: 'شاكوش مسلح من ستانلي.', descriptionEn: 'Reinforced hammer from Stanley.', price: 180, unit: ProductUnit.piece, stock: 100, categorySlug: 'hand-tools', brandSlug: 'stanley', minOrderQty: 1 },

    // ADHESIVES & WATERPROOFING
    { sku: 'ADH-SAVETO-25', nameAr: 'لاصق سيراميك سافيتو 25 كجم', nameEn: 'Saveto Ceramic Adhesive 25kg', descriptionAr: 'لاصق سيراميك عالي الجودة من سافيتو.', descriptionEn: 'High quality ceramic adhesive from Saveto.', price: 120, unit: ProductUnit.bag, stock: 400, categorySlug: 'adhesives', brandSlug: 'saveto', isFeatured: true, minOrderQty: 5 },
    { sku: 'ADH-SIKA-WP', nameAr: 'عازل سيكا مائي 20 لتر', nameEn: 'Sika Waterproofing 20L', descriptionAr: 'عازل مائي من سيكا للأسطح والحمامات.', descriptionEn: 'Waterproofing from Sika.', price: 850, unit: ProductUnit.piece, stock: 100, categorySlug: 'waterproofing', brandSlug: 'sika', isFeatured: true, minOrderQty: 1 },
    { sku: 'ADH-FOSROC-WP', nameAr: 'عازل فوسروك للخزانات', nameEn: 'Fosroc Tank Waterproofing', descriptionAr: 'عازل مائي للخزانات.', descriptionEn: 'Waterproofing for tanks.', price: 1200, unit: ProductUnit.piece, stock: 60, categorySlug: 'waterproofing', brandSlug: 'fosroc', minOrderQty: 1 },
    { sku: 'ADH-MAPEI-GRT', nameAr: 'جراوت ماركو ملون 5 كجم', nameEn: 'Mapei Colored Grout 5kg', descriptionAr: 'جراوت ملون للسيراميك.', descriptionEn: 'Colored grout for ceramic.', price: 95, unit: ProductUnit.bag, stock: 300, categorySlug: 'adhesives', brandSlug: 'mapei', minOrderQty: 5 },

    // GYPSUM & CEILINGS
    { sku: 'GYP-BOARD-12', nameAr: 'ألواح جبس بورد 12 مم', nameEn: 'Gypsum Board 12mm', descriptionAr: 'ألواح جبس بورد للأسقف والحوائط.', descriptionEn: 'Gypsum boards for ceilings and walls.', price: 180, unit: ProductUnit.piece, stock: 500, categorySlug: 'gypsum', isFeatured: true, minOrderQty: 10 },
    { sku: 'GYP-BOARD-MR', nameAr: 'جبس بورد مقاوم للرطوبة', nameEn: 'Moisture Resistant Gypsum Board', descriptionAr: 'ألواح جبس مقاومة للرطوبة.', descriptionEn: 'Moisture resistant gypsum boards.', price: 250, unit: ProductUnit.piece, stock: 300, categorySlug: 'gypsum', minOrderQty: 10 },
  ];

  for (const product of productsData) {
    const categoryId = categoryMap[product.categorySlug];
    const brandId = product.brandSlug ? brandMap[product.brandSlug] : undefined;

    if (!categoryId) {
      console.log(`⚠️ Category not found for product: ${product.sku}`);
      continue;
    }

    const { categorySlug, brandSlug, ...productData } = product;

    const existingProduct = await prisma.product.findUnique({ where: { sku: product.sku } });

    const created = existingProduct
      ? await prisma.product.update({
          where: { sku: product.sku },
          data: { ...productData, categoryId, brandId, isActive: true },
        })
      : await prisma.product.create({
          data: { ...productData, categoryId, brandId, isActive: true },
        });

    // Add placeholder image
    await prisma.productImage.upsert({
      where: { id: `${created.id}-img` },
      update: {},
      create: {
        id: `${created.id}-img`,
        productId: created.id,
        url: `https://placehold.co/600x600/e2e8f0/64748b?text=${encodeURIComponent(product.nameEn.substring(0, 20))}`,
        isPrimary: true,
        sortOrder: 0,
      },
    });
  }
  console.log(`✅ ${productsData.length} products created`);

  // Create CMS Content
  const contentData = [
    { type: ContentType.banner, key: 'hero-1', titleAr: 'أفضل مواد البناء في مصر', titleEn: 'Best Building Materials in Egypt', contentAr: 'تسوق الآن واحصل على خصم 10% على طلبك الأول', contentEn: 'Shop now and get 10% off your first order', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200', linkUrl: '/products', sortOrder: 1, isActive: true },
    { type: ContentType.banner, key: 'hero-2', titleAr: 'توصيل سريع لموقعك', titleEn: 'Fast Delivery to Your Site', contentAr: 'نوصل لجميع أنحاء مصر', contentEn: 'We deliver across Egypt', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', linkUrl: '/delivery', sortOrder: 2, isActive: true },
    { type: ContentType.banner, key: 'hero-3', titleAr: 'أسعار الجملة للجميع', titleEn: 'Wholesale Prices for Everyone', contentAr: 'وفر أكثر مع الكميات الكبيرة', contentEn: 'Save more with bulk orders', imageUrl: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=1200', linkUrl: '/categories', sortOrder: 3, isActive: true },
    { type: ContentType.announcement, key: 'promo-welcome', titleAr: 'كود خصم WELCOME10', titleEn: 'Promo Code WELCOME10', contentAr: 'استخدم كود WELCOME10 للحصول على خصم 10%!', contentEn: 'Use code WELCOME10 to get 10% off!', sortOrder: 1, isActive: true },
    { type: ContentType.announcement, key: 'delivery-notice', titleAr: 'توصيل مجاني', titleEn: 'Free Delivery', contentAr: 'توصيل مجاني للطلبات أكثر من 5000 جنيه داخل القاهرة الكبرى', contentEn: 'Free delivery for orders over 5000 EGP in Greater Cairo', sortOrder: 2, isActive: true },
    { type: ContentType.faq, key: 'faq-delivery', titleAr: 'ما هي مناطق التوصيل؟', titleEn: 'What are the delivery areas?', contentAr: 'نوصل لجميع محافظات مصر.', contentEn: 'We deliver to all governorates in Egypt.', sortOrder: 1, isActive: true },
    { type: ContentType.faq, key: 'faq-payment', titleAr: 'ما هي طرق الدفع المتاحة؟', titleEn: 'What payment methods are available?', contentAr: 'نقبل الدفع نقداً عند الاستلام، بطاقات الائتمان، فوري.', contentEn: 'We accept cash on delivery, credit cards, Fawry.', sortOrder: 2, isActive: true },
    { type: ContentType.faq, key: 'faq-returns', titleAr: 'ما هي سياسة الإرجاع؟', titleEn: 'What is the return policy?', contentAr: 'يمكنك إرجاع المنتجات خلال 7 أيام من الاستلام.', contentEn: 'You can return products within 7 days of delivery.', sortOrder: 3, isActive: true },
    { type: ContentType.about, key: 'about-main', titleAr: 'من نحن', titleEn: 'About Us', contentAr: 'شطابلي هي منصة إلكترونية رائدة في مجال مواد البناء في مصر.', contentEn: 'Shatably is a leading e-commerce platform for building materials in Egypt.', sortOrder: 1, isActive: true },
    { type: ContentType.terms, key: 'terms-main', titleAr: 'الشروط والأحكام', titleEn: 'Terms & Conditions', contentAr: 'باستخدامك لموقع شطابلي، فإنك توافق على هذه الشروط.', contentEn: 'By using Shatably website, you agree to these terms.', sortOrder: 1, isActive: true },
    { type: ContentType.privacy, key: 'privacy-main', titleAr: 'سياسة الخصوصية', titleEn: 'Privacy Policy', contentAr: 'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.', contentEn: 'We respect your privacy and are committed to protecting your personal data.', sortOrder: 1, isActive: true },
  ];

  for (const content of contentData) {
    await prisma.content.upsert({
      where: { key: content.key },
      update: content,
      create: content,
    });
  }
  console.log(`✅ ${contentData.length} content items created`);

  // Create promo codes
  const promoData = [
    { code: 'WELCOME10', type: 'percentage' as const, value: 10, minOrderAmount: 500, maxDiscount: 200, startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), isActive: true },
    { code: 'BULK20', type: 'percentage' as const, value: 20, minOrderAmount: 10000, maxDiscount: 2000, startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), isActive: true },
    { code: 'FREESHIP', type: 'fixed' as const, value: 150, minOrderAmount: 3000, startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), isActive: true },
  ];

  for (const promo of promoData) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: promo,
      create: promo,
    });
  }
  console.log(`✅ ${promoData.length} promo codes created`);

  // Create sample driver
  await prisma.driver.upsert({
    where: { phone: '01111111111' },
    update: {},
    create: { name: 'أحمد محمد', phone: '01111111111', email: 'driver@shatably.com', vehicle: 'تريلا', plateNumber: 'أ ب ج 1234', isActive: true },
  });
  console.log('✅ Sample driver created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('📱 Admin Login: 01000000000');
  console.log('🎟️ Promo Codes: WELCOME10, BULK20, FREESHIP');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
