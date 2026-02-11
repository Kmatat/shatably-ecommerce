import { PrismaClient, ProductUnit, ContentType, AttributeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Cleaning up database...');
  // Clean up order matters due to foreign keys
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productAttributeValue.deleteMany();
  await prisma.productVariation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.attributeOption.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.content.deleteMany();
  await prisma.promoCode.deleteMany();
  
  console.log('🌱 Seeding database with Real Egyptian Market Data...');

  // Create super admin user
  const adminPhone = '01000000000';
  await prisma.user.upsert({
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
  console.log(`✅ Super Admin user: ${adminPhone}`);

  // 1. Create Categories (Egyptian Market Standard)
  const categoriesData = [
    {
      nameAr: 'دهانات وديكور', nameEn: 'Paints & Decor', slug: 'paints', icon: '🎨',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800',
      children: [
        { nameAr: 'دهانات داخلية', nameEn: 'Interior Paints', slug: 'interior-paints', icon: '🏠' },
        { nameAr: 'دهانات خارجية', nameEn: 'Exterior Paints', slug: 'exterior-paints', icon: '🏢' },
        { nameAr: 'تأسيس ومعجون', nameEn: 'Primers & Putty', slug: 'primers', icon: '🖌️' },
        { nameAr: 'ورنيش وأخشاب', nameEn: 'Wood & Varnish', slug: 'wood-paints', icon: '🪵' },
        { nameAr: 'أدوات طلاء', nameEn: 'Painting Tools', slug: 'paint-tools', icon: '🔨' },
      ],
    },
    {
      nameAr: 'كيماويات بناء', nameEn: 'Construction Chemicals', slug: 'chemicals', icon: '🧪',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
      children: [
        { nameAr: 'إضافات خرسانة', nameEn: 'Concrete Admixtures', slug: 'admixtures', icon: '🏗️' },
        { nameAr: 'عوازل', nameEn: 'Insulation & Waterproofing', slug: 'insulation', icon: '🛡️' },
        { nameAr: 'لواصق سيراميك', nameEn: 'Tile Adhesives', slug: 'adhesives', icon: '🧱' },
        { nameAr: 'مورتر وجراوت', nameEn: 'Mortars & Grouts', slug: 'mortars', icon: '🥣' },
      ],
    },
    {
      nameAr: 'جبس وأسقف', nameEn: 'Gypsum & Ceilings', slug: 'gypsum', icon: '🏗️',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
      children: [
        { nameAr: 'ألواح جبس بورد', nameEn: 'Gypsum Boards', slug: 'gypsum-boards', icon: '⬜' },
        { nameAr: 'بلاطات أسقف', nameEn: 'Ceiling Tiles', slug: 'ceiling-tiles', icon: '🏁' },
        { nameAr: 'قطاعات حديد', nameEn: 'Metal Profiles', slug: 'metal-profiles', icon: '📏' },
        { nameAr: 'إكسسوارات جبس', nameEn: 'Gypsum Accessories', slug: 'gypsum-accessories', icon: '🔩' },
      ],
    },
    {
      nameAr: 'زجاج ومرايات', nameEn: 'Glass & Mirrors', slug: 'glass', icon: '🪟',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
      children: [
        { nameAr: 'زجاج شفاف', nameEn: 'Clear Glass', slug: 'clear-glass', icon: '🪟' },
        { nameAr: 'مرايات', nameEn: 'Mirrors', slug: 'mirrors', icon: '🪞' },
        { nameAr: 'سيكوريت', nameEn: 'Securit Glass', slug: 'securit', icon: '🛡️' },
      ],
    },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const { children, ...parentData } = cat;
    const parent = await prisma.category.create({
      data: { ...parentData, isActive: true },
    });
    categoryMap[parentData.slug] = parent.id;

    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const created = await prisma.category.create({
          data: { ...child, parentId: parent.id, isActive: true, sortOrder: i },
        });
        categoryMap[child.slug] = created.id;
      }
    }
  }
  console.log('✅ Categories created');

  // 2. Create Brands (Requested List)
  const brandsData = [
    { nameAr: 'سان جوبان', nameEn: 'Saint Gobain', slug: 'saint-gobain', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Saint-Gobain_Logo.svg/1200px-Saint-Gobain_Logo.svg.png' },
    { nameAr: 'جوتن', nameEn: 'Jotun', slug: 'jotun', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Jotun_logo.svg/2560px-Jotun_logo.svg.png' },
    { nameAr: 'سكيب', nameEn: 'SCIB', slug: 'scib', logo: 'https://www.scibpaints.com/wp-content/uploads/2020/01/Scib-Logo.png' },
    { nameAr: 'جي إل سي', nameEn: 'GLC', slug: 'glc', logo: 'https://glcpaints.com/wp-content/uploads/2020/12/logo.png' },
    { nameAr: 'سي إم بي', nameEn: 'CMB', slug: 'cmb', logo: 'https://www.cmbegypt.com/images/logo.png' },
    { nameAr: 'ويبر', nameEn: 'Weber', slug: 'weber', logo: 'https://www.egypt.weber/files/eg/styles/960x960_resize/public/pictures/2018-02/Weber_Logo_CMYK.png' }, // Saint Gobain brand
    { nameAr: 'جيبروك', nameEn: 'Gyproc', slug: 'gyproc', logo: 'https://www.gyproc.ie/sites/gyproc.ie/files/gyproc_logo.png' }, // Saint Gobain brand
  ];

  const brandMap: Record<string, string> = {};

  for (const brand of brandsData) {
    const created = await prisma.brand.create({
      data: { ...brand, isActive: true },
    });
    brandMap[brand.slug] = created.id;
  }
  console.log('✅ Brands created (Saint Gobain, Jotun, SCIB, GLC, CMB)');

  // 3. Create Products (Real Data)
  const productsData = [
    // --- JOTUN PRODUCTS ---
    {
      sku: 'JOT-FEN-RICH-18',
      nameAr: 'جوتن فينوماستيك ماي هوم ريتش مط - 18 لتر',
      nameEn: 'Jotun Fenomastic My Home Rich Matt - 18L',
      descriptionAr: 'دهان مائي داخلي عالي الجودة يعطي مظهر مطفي غني وألوان دقيقة. قابل للغسيل ومقاوم للاصفرار.',
      descriptionEn: 'High quality interior water-based paint giving a rich matt finish and accurate colors. Washable and anti-yellowing.',
      price: 1850,
      unit: ProductUnit.piece,
      stock: 50,
      categorySlug: 'interior-paints',
      brandSlug: 'jotun',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80', // Paint bucket/brush generic
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', // Paint cans
        'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=800&q=80'  // Painted room
      ]
    },
    {
      sku: 'JOT-SHIELD-SILK-18',
      nameAr: 'جوتن جوتاشيلد سيلك - 18 لتر',
      nameEn: 'Jotun Jotashield Silk - 18L',
      descriptionAr: 'دهان خارجي أكريليك نقي عالي الجودة يوفر حماية ممتازة ضد العوامل الجوية.',
      descriptionEn: 'Premium pure acrylic exterior paint offering excellent weather protection.',
      price: 2100,
      unit: ProductUnit.piece,
      stock: 40,
      categorySlug: 'exterior-paints',
      brandSlug: 'jotun',
      images: [
        'https://images.unsplash.com/photo-1595429035839-c99c298ffdde?auto=format&fit=crop&w=800&q=80', // Exterior house paint
        'https://images.unsplash.com/photo-1628131333796-03c03db29237?auto=format&fit=crop&w=800&q=80', // Paint bucket
      ]
    },

    // --- SCIB PRODUCTS ---
    {
      sku: 'SCIB-ROYAL-SILK-9',
      nameAr: 'سكيب رويال تون سيلك - 9 لتر',
      nameEn: 'SCIB Royaltone Silk - 9L',
      descriptionAr: 'دهان بلاستيك نصف لامع عالي الجودة، قابل للغسيل والاحتكاك.',
      descriptionEn: 'High quality semi-gloss plastic paint, washable and scrub resistant.',
      price: 850,
      unit: ProductUnit.piece,
      stock: 60,
      categorySlug: 'interior-paints',
      brandSlug: 'scib',
      images: [
        'https://images.unsplash.com/photo-1632759972306-6953c92332a6?auto=format&fit=crop&w=800&q=80', // Paint roller
        'https://images.unsplash.com/photo-1572048572872-2394404cf1f3?auto=format&fit=crop&w=800&q=80'  // Colors
      ]
    },
    {
      sku: 'SCIB-SUPER-DI-15',
      nameAr: 'سكيب سوبر دايتون - 15 لتر',
      nameEn: 'SCIB Super Dieton - 15L',
      descriptionAr: 'دهان بلاستيك مطفي اقتصادي للأسقف والحوائط الداخلية.',
      descriptionEn: 'Economic matt plastic paint for ceilings and interior walls.',
      price: 450,
      unit: ProductUnit.piece,
      stock: 100,
      categorySlug: 'interior-paints',
      brandSlug: 'scib',
      images: [
        'https://images.unsplash.com/photo-1533630764724-42b793393272?auto=format&fit=crop&w=800&q=80', // White paint
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // --- GLC PRODUCTS ---
    {
      sku: 'GLC-DEUS-3030',
      nameAr: 'جي إل سي سوبر دايوس 3030 - 15 لتر',
      nameEn: 'GLC Super Deus 3030 - 15L',
      descriptionAr: 'دهان بلاستيك مطفي داخلي عالي الجودة، بياض ناصع وتغطية ممتازة.',
      descriptionEn: 'High quality interior matt plastic paint, bright white and excellent coverage.',
      price: 680,
      unit: ProductUnit.piece,
      stock: 150,
      categorySlug: 'interior-paints',
      brandSlug: 'glc',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1599691626233-3e3c6396cb71?auto=format&fit=crop&w=800&q=80', // Paint bucket
        'https://images.unsplash.com/photo-1574950578143-858c6fc58922?auto=format&fit=crop&w=800&q=80'  // Painting process
      ]
    },
    {
      sku: 'GLC-STORM-SHIELD',
      nameAr: 'جي إل سي ستورم شيلد - 10 لتر',
      nameEn: 'GLC Storm Shield - 10L',
      descriptionAr: 'دهان خارجي مقاوم للعوامل الجوية القاسية والأمطار.',
      descriptionEn: 'Exterior paint resistant to harsh weather and rain.',
      price: 950,
      unit: ProductUnit.piece,
      stock: 30,
      categorySlug: 'exterior-paints',
      brandSlug: 'glc',
      images: [
        'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?auto=format&fit=crop&w=800&q=80', // Exterior wall
        'https://images.unsplash.com/photo-1595429035839-c99c298ffdde?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // --- CMB PRODUCTS ---
    {
      sku: 'CMB-ADDIBOND-65-1KG',
      nameAr: 'أديبوند 65 - 1 كجم',
      nameEn: 'Addibond 65 - 1kg',
      descriptionAr: 'مادة رابطة متعددة الأغراض للخرسانة والمونة، تزيد من قوة الالتصاق.',
      descriptionEn: 'Multi-purpose bonding agent for concrete and mortar, increases adhesion strength.',
      price: 85,
      unit: ProductUnit.piece,
      stock: 200,
      categorySlug: 'admixtures',
      brandSlug: 'cmb',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', // Construction chemicals
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      sku: 'CMB-KEMAPOXY-131',
      nameAr: 'كيما بوكسي 131 - 1 كجم',
      nameEn: 'Kemapoxy 131 - 1kg',
      descriptionAr: 'طلاء إيبوكسي للأرضيات والخزانات، مقاوم للكيماويات.',
      descriptionEn: 'Epoxy coating for floors and tanks, chemical resistant.',
      price: 320,
      unit: ProductUnit.piece,
      stock: 50,
      categorySlug: 'chemicals',
      brandSlug: 'cmb',
      images: [
        'https://images.unsplash.com/photo-1626622709280-992a0129712c?auto=format&fit=crop&w=800&q=80', // Epoxy floor
        'https://images.unsplash.com/photo-1622372738946-62e02505f43d?auto=format&fit=crop&w=800&q=80'
      ]
    },

    // --- SAINT GOBAIN PRODUCTS (Gyproc, Weber, Glass) ---
    {
      sku: 'GYP-REG-12.5',
      nameAr: 'لوح جبس بورد جيبروك عادي 12.5 مم',
      nameEn: 'Gyproc Regular Board 12.5mm',
      descriptionAr: 'ألواح جبسية قياسية للأسقف المعلقة والحوائط الجافة. المقاس: 1200×3000 مم.',
      descriptionEn: 'Standard gypsum boards for suspended ceilings and drywalls. Size: 1200x3000mm.',
      price: 165,
      unit: ProductUnit.piece,
      stock: 300,
      categorySlug: 'gypsum-boards',
      brandSlug: 'gyproc',
      minOrderQty: 10,
      images: [
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80', // Gypsum stack
        'https://images.unsplash.com/photo-1594247563032-132ebff59b63?auto=format&fit=crop&w=800&q=80'  // Ceiling installation
      ]
    },
    {
      sku: 'GYP-MR-12.5',
      nameAr: 'لوح جبس بورد جيبروك مقاوم للرطوبة (أخضر)',
      nameEn: 'Gyproc Moisture Resistant Board (Green)',
      descriptionAr: 'ألواح جبسية مقاومة للرطوبة للحمامات والمطابخ. المقاس: 1200×3000 مم.',
      descriptionEn: 'Moisture resistant gypsum boards for bathrooms and kitchens. Size: 1200x3000mm.',
      price: 210,
      unit: ProductUnit.piece,
      stock: 200,
      categorySlug: 'gypsum-boards',
      brandSlug: 'gyproc',
      images: [
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80', // Green board generic
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      sku: 'WEB-KOL-20',
      nameAr: 'لاصق سيراميك ويبر كول - 20 كجم',
      nameEn: 'Weber.col Standard - 20kg',
      descriptionAr: 'مادة لاصقة للسيراميك والبلاط، قوة التصاق عالية.',
      descriptionEn: 'Cement-based tile adhesive with high bonding strength.',
      price: 95,
      unit: ProductUnit.bag,
      stock: 400,
      categorySlug: 'adhesives',
      brandSlug: 'weber',
      images: [
        'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80', // Bag of cement/adhesive
        'https://images.unsplash.com/photo-1620619767323-b95a89183081?auto=format&fit=crop&w=800&q=80'  // Tiling
      ]
    },
    {
      sku: 'SG-MIRROR-6MM',
      nameAr: 'مرآة سان جوبان 6 مم (متر مربع)',
      nameEn: 'Saint Gobain Mirror 6mm (m²)',
      descriptionAr: 'مرايا عالية النقاء والوضوح من سان جوبان.',
      descriptionEn: 'High clarity mirrors from Saint Gobain.',
      price: 850,
      unit: ProductUnit.sqmeter,
      stock: 50,
      categorySlug: 'mirrors',
      brandSlug: 'saint-gobain',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80', // Mirror
        'https://images.unsplash.com/photo-1595515106967-1434857ed8dd?auto=format&fit=crop&w=800&q=80'  // Mirror reflection
      ]
    }
  ];

  for (const product of productsData) {
    const categoryId = categoryMap[product.categorySlug];
    const brandId = product.brandSlug ? brandMap[product.brandSlug] : undefined;

    if (!categoryId) {
      console.log(`⚠️ Category not found: ${product.categorySlug}`);
      continue;
    }

    const { categorySlug, brandSlug, images, ...productData } = product;

    const created = await prisma.product.create({
      data: {
        ...productData,
        categoryId,
        brandId,
        isActive: true,
      },
    });

    if (images && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url, idx) => ({
          productId: created.id,
          url,
          isPrimary: idx === 0,
          sortOrder: idx,
        })),
      });
    } else {
        // Fallback placeholder
        await prisma.productImage.create({
            data: {
                productId: created.id,
                url: `https://placehold.co/600x600/e2e8f0/64748b?text=${encodeURIComponent(product.nameEn.substring(0, 10))}`,
                isPrimary: true,
                sortOrder: 0
            }
        });
    }
  }
  console.log('✅ Products created');

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
    
    // Features (Why Shatably)
    { type: ContentType.feature, key: 'feat-delivery', titleAr: 'توصيل سريع', titleEn: 'Fast Delivery', contentAr: 'توصيل خلال 3 ساعات للطلبات العاجلة أو اختر موعد يناسبك', contentEn: '3-hour delivery for urgent orders or schedule at your convenience', metadata: { icon: '🚚' }, sortOrder: 1, isActive: true },
    { type: ContentType.feature, key: 'feat-price', titleAr: 'أسعار تنافسية', titleEn: 'Competitive Prices', contentAr: 'أفضل الأسعار مع عروض وخصومات مستمرة على جميع المنتجات', contentEn: 'Best prices with ongoing offers and discounts on all products', metadata: { icon: '💰' }, sortOrder: 2, isActive: true },
    { type: ContentType.feature, key: 'feat-quality', titleAr: 'جودة مضمونة', titleEn: 'Quality Guaranteed', contentAr: 'جميع منتجاتنا أصلية ومطابقة للمواصفات القياسية', contentEn: 'All our products are genuine and meet quality standards', metadata: { icon: '✅' }, sortOrder: 3, isActive: true },
    { type: ContentType.feature, key: 'feat-list', titleAr: 'خدمة قائمة المواد', titleEn: 'Material List Service', contentAr: 'ارفع قائمة المواد وفريقنا يجهز طلبك بالكامل', contentEn: 'Upload your material list and our team prepares your order', metadata: { icon: '📋' }, sortOrder: 4, isActive: true },
  ];

  for (const content of contentData) {
    // Check if type is 'feature' (since it might not be in the imported ContentType yet if types aren't regenerated)
    const type = content.type as ContentType;
    await prisma.content.upsert({
      where: { key: content.key },
      update: { ...content, type },
      create: { ...content, type },
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

  console.log('\n🎉 Real Data Seeding Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
