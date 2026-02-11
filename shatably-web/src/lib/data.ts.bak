import type { Product, Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'structural',
    nameAr: 'مواد هيكلية',
    nameEn: 'Structural Materials',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    icon: '🏗️',
    sortOrder: 1,
    children: [
      { id: 'cement', nameAr: 'أسمنت', nameEn: 'Cement', image: '', sortOrder: 1 },
      { id: 'steel', nameAr: 'حديد', nameEn: 'Steel', image: '', sortOrder: 2 },
      { id: 'bricks', nameAr: 'طوب', nameEn: 'Bricks', image: '', sortOrder: 3 },
      { id: 'sand', nameAr: 'رمل', nameEn: 'Sand', image: '', sortOrder: 4 },
      { id: 'gravel', nameAr: 'زلط', nameEn: 'Gravel', image: '', sortOrder: 5 },
    ],
  },
  {
    id: 'finishing',
    nameAr: 'تشطيبات',
    nameEn: 'Finishing Materials',
    image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400',
    icon: '🎨',
    sortOrder: 2,
    children: [
      { id: 'tiles', nameAr: 'بلاط وسيراميك', nameEn: 'Tiles & Ceramics', image: '', sortOrder: 1 },
      { id: 'paints', nameAr: 'دهانات', nameEn: 'Paints', image: '', sortOrder: 2 },
      { id: 'gypsum', nameAr: 'جبس', nameEn: 'Gypsum', image: '', sortOrder: 3 },
      { id: 'adhesives', nameAr: 'لاصق ومونة', nameEn: 'Adhesives & Mortar', image: '', sortOrder: 4 },
    ],
  },
  {
    id: 'plumbing',
    nameAr: 'سباكة',
    nameEn: 'Plumbing',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
    icon: '🚿',
    sortOrder: 3,
    children: [
      { id: 'pipes', nameAr: 'مواسير', nameEn: 'Pipes', image: '', sortOrder: 1 },
      { id: 'fittings', nameAr: 'وصلات', nameEn: 'Fittings', image: '', sortOrder: 2 },
      { id: 'faucets', nameAr: 'خلاطات', nameEn: 'Faucets', image: '', sortOrder: 3 },
      { id: 'sanitary', nameAr: 'أدوات صحية', nameEn: 'Sanitary Ware', image: '', sortOrder: 4 },
    ],
  },
  {
    id: 'electrical',
    nameAr: 'كهرباء',
    nameEn: 'Electrical',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    icon: '💡',
    sortOrder: 4,
    children: [
      { id: 'wiring', nameAr: 'أسلاك', nameEn: 'Wiring', image: '', sortOrder: 1 },
      { id: 'switches', nameAr: 'مفاتيح ومقابس', nameEn: 'Switches & Outlets', image: '', sortOrder: 2 },
      { id: 'lighting', nameAr: 'إضاءة', nameEn: 'Lighting', image: '', sortOrder: 3 },
      { id: 'panels', nameAr: 'لوحات كهربية', nameEn: 'Electrical Panels', image: '', sortOrder: 4 },
    ],
  },
  {
    id: 'tools',
    nameAr: 'عدد وأدوات',
    nameEn: 'Tools & Hardware',
    image: 'https://images.unsplash.com/photo-1581147036324-c17ac41f3a1b?w=400',
    icon: '🔧',
    sortOrder: 5,
    children: [
      { id: 'hand-tools', nameAr: 'عدد يدوية', nameEn: 'Hand Tools', image: '', sortOrder: 1 },
      { id: 'power-tools', nameAr: 'عدد كهربية', nameEn: 'Power Tools', image: '', sortOrder: 2 },
      { id: 'fasteners', nameAr: 'مسامير وبراغي', nameEn: 'Fasteners', image: '', sortOrder: 3 },
      { id: 'safety', nameAr: 'معدات سلامة', nameEn: 'Safety Equipment', image: '', sortOrder: 4 },
    ],
  },
  {
    id: 'doors-windows',
    nameAr: 'أبواب ونوافذ',
    nameEn: 'Doors & Windows',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    icon: '🚪',
    sortOrder: 6,
    children: [
      { id: 'wood-doors', nameAr: 'أبواب خشب', nameEn: 'Wood Doors', image: '', sortOrder: 1 },
      { id: 'aluminum', nameAr: 'ألوميتال', nameEn: 'Aluminum', image: '', sortOrder: 2 },
      { id: 'glass', nameAr: 'زجاج', nameEn: 'Glass', image: '', sortOrder: 3 },
      { id: 'handles', nameAr: 'يد وكوالين', nameEn: 'Handles & Locks', image: '', sortOrder: 4 },
    ],
  },
];

export const products: Product[] = [
  // Cement Products
  {
    id: 'cem-001',
    sku: 'CEM-ARAB-50',
    nameAr: 'أسمنت العربي بورتلاندي',
    nameEn: 'Al Arabi Portland Cement',
    descriptionAr: 'أسمنت بورتلاندي عادي عالي الجودة، مناسب لجميع أعمال البناء والخرسانة. شيكارة 50 كجم.',
    descriptionEn: 'High quality ordinary Portland cement, suitable for all construction and concrete works. 50 kg bag.',
    price: 95,
    originalPrice: 105,
    discount: 10,
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    ],
    categoryId: 'cement',
    brandId: 'arab-cement',
    stock: 500,
    unit: 'bag',
    specifications: {
      'الوزن': '50 كجم',
      'النوع': 'بورتلاندي عادي',
      'القوة': '42.5N',
    },
    rating: 4.5,
    reviewCount: 128,
    isFeatured: true,
    isOnSale: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'cem-002',
    sku: 'CEM-SINAI-50',
    nameAr: 'أسمنت سيناء للبناء',
    nameEn: 'Sinai Construction Cement',
    descriptionAr: 'أسمنت مصري عالي الجودة من إنتاج سيناء للأسمنت. مثالي لجميع أعمال البناء.',
    descriptionEn: 'High quality Egyptian cement from Sinai Cement. Ideal for all construction works.',
    price: 92,
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    ],
    categoryId: 'cement',
    brandId: 'sinai-cement',
    stock: 350,
    unit: 'bag',
    specifications: {
      'الوزن': '50 كجم',
      'النوع': 'بورتلاندي عادي',
    },
    rating: 4.3,
    reviewCount: 89,
    createdAt: '2024-01-05',
  },
  // Steel Products
  {
    id: 'stl-001',
    sku: 'STL-EZZ-12',
    nameAr: 'حديد تسليح عز 12 مم',
    nameEn: 'Ezz Steel Rebar 12mm',
    descriptionAr: 'حديد تسليح من إنتاج حديد عز، قطر 12 مم، طول 12 متر. مطابق للمواصفات المصرية.',
    descriptionEn: 'Reinforcement steel from Ezz Steel, 12mm diameter, 12m length. Compliant with Egyptian standards.',
    price: 42500,
    images: [
      'https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=400',
    ],
    categoryId: 'steel',
    brandId: 'ezz-steel',
    stock: 100,
    unit: 'ton',
    specifications: {
      'القطر': '12 مم',
      'الطول': '12 متر',
      'النوع': 'حديد تسليح',
    },
    rating: 4.8,
    reviewCount: 256,
    isFeatured: true,
    createdAt: '2024-01-02',
  },
  // Tiles Products
  {
    id: 'til-001',
    sku: 'TIL-CLEOPATRA-60',
    nameAr: 'سيراميك كليوباترا 60×60',
    nameEn: 'Cleopatra Ceramic Tiles 60x60',
    descriptionAr: 'سيراميك أرضيات من كليوباترا، مقاس 60×60 سم، لون رمادي مط. العلبة 4 قطع (1.44 م²).',
    descriptionEn: 'Floor ceramic tiles from Cleopatra, 60x60 cm size, matte grey color. Box contains 4 pieces (1.44 sqm).',
    price: 185,
    originalPrice: 210,
    discount: 12,
    images: [
      'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400',
    ],
    categoryId: 'tiles',
    brandId: 'cleopatra',
    stock: 200,
    unit: 'box',
    specifications: {
      'المقاس': '60×60 سم',
      'السماكة': '10 مم',
      'عدد القطع': '4 قطع/علبة',
      'المساحة': '1.44 م²/علبة',
    },
    rating: 4.6,
    reviewCount: 312,
    isFeatured: true,
    isOnSale: true,
    createdAt: '2024-01-03',
  },
  // Paint Products
  {
    id: 'pnt-001',
    sku: 'PNT-JOTUN-18',
    nameAr: 'دهان جوتن فينوماستيك',
    nameEn: 'Jotun Fenomastic Paint',
    descriptionAr: 'دهان داخلي ممتاز من جوتن، قابل للغسيل، تغطية عالية. جالون 18 لتر.',
    descriptionEn: 'Premium interior paint from Jotun, washable, high coverage. 18 liter gallon.',
    price: 1450,
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    ],
    categoryId: 'paints',
    brandId: 'jotun',
    stock: 150,
    unit: 'piece',
    specifications: {
      'الحجم': '18 لتر',
      'النوع': 'مط',
      'الاستخدام': 'داخلي',
      'التغطية': '12-14 م²/لتر',
    },
    rating: 4.7,
    reviewCount: 198,
    isFeatured: true,
    createdAt: '2024-01-04',
  },
  {
    id: 'pnt-002',
    sku: 'PNT-SCIB-18',
    nameAr: 'دهان سايب سوبر',
    nameEn: 'Scib Super Paint',
    descriptionAr: 'دهان بلاستيك للحوائط الداخلية من سايب. جالون 18 لتر.',
    descriptionEn: 'Plastic paint for interior walls from Scib. 18 liter gallon.',
    price: 850,
    images: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
    ],
    categoryId: 'paints',
    brandId: 'scib',
    stock: 200,
    unit: 'piece',
    specifications: {
      'الحجم': '18 لتر',
      'النوع': 'بلاستيك',
    },
    rating: 4.2,
    reviewCount: 145,
    createdAt: '2024-01-06',
  },
  // Electrical Products
  {
    id: 'elc-001',
    sku: 'ELC-WIRE-2.5',
    nameAr: 'سلك كهرباء نحاس 2.5 مم',
    nameEn: 'Copper Wire 2.5mm',
    descriptionAr: 'سلك كهرباء نحاس عالي الجودة، مقاس 2.5 مم². لفة 100 متر.',
    descriptionEn: 'High quality copper electrical wire, 2.5mm² size. 100 meter roll.',
    price: 2800,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    ],
    categoryId: 'wiring',
    brandId: 'elsewedy',
    stock: 80,
    unit: 'piece',
    specifications: {
      'المقطع': '2.5 مم²',
      'الطول': '100 متر',
      'الخامة': 'نحاس نقي',
    },
    rating: 4.5,
    reviewCount: 87,
    createdAt: '2024-01-07',
  },
  // Plumbing Products
  {
    id: 'plm-001',
    sku: 'PLM-PIPE-3/4',
    nameAr: 'ماسورة PPR 3/4 بوصة',
    nameEn: 'PPR Pipe 3/4 inch',
    descriptionAr: 'ماسورة PPR للمياه الساخنة والباردة، 3/4 بوصة. طول 4 متر.',
    descriptionEn: 'PPR pipe for hot and cold water, 3/4 inch. 4 meter length.',
    price: 45,
    images: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
    ],
    categoryId: 'pipes',
    brandId: 'aquatherm',
    stock: 500,
    unit: 'piece',
    specifications: {
      'القطر': '3/4 بوصة',
      'الطول': '4 متر',
      'الضغط': 'PN20',
    },
    rating: 4.4,
    reviewCount: 156,
    createdAt: '2024-01-08',
  },
  // Tools
  {
    id: 'tol-001',
    sku: 'TOL-DRILL-BOSCH',
    nameAr: 'شنيور بوش احترافي',
    nameEn: 'Bosch Professional Drill',
    descriptionAr: 'شنيور كهربائي من بوش، 750 وات، مع مجموعة ريش.',
    descriptionEn: 'Electric drill from Bosch, 750W, with drill bit set.',
    price: 2500,
    originalPrice: 2900,
    discount: 14,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    ],
    categoryId: 'power-tools',
    brandId: 'bosch',
    stock: 25,
    unit: 'piece',
    specifications: {
      'القدرة': '750 وات',
      'السرعة': '2800 دورة/دقيقة',
    },
    rating: 4.9,
    reviewCount: 234,
    isFeatured: true,
    isOnSale: true,
    createdAt: '2024-01-09',
  },
  // Bricks
  {
    id: 'brk-001',
    sku: 'BRK-RED-1000',
    nameAr: 'طوب أحمر 1000 طوبة',
    nameEn: 'Red Bricks (1000 pcs)',
    descriptionAr: 'طوب أحمر طفلي للبناء، 1000 طوبة. مقاس 25×12×6.5 سم.',
    descriptionEn: 'Red clay bricks for construction, 1000 pieces. Size 25x12x6.5 cm.',
    price: 1800,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
    categoryId: 'bricks',
    stock: 50,
    unit: 'piece',
    specifications: {
      'المقاس': '25×12×6.5 سم',
      'الكمية': '1000 طوبة',
    },
    rating: 4.3,
    reviewCount: 67,
    createdAt: '2024-01-10',
  },
  // Sand
  {
    id: 'snd-001',
    sku: 'SND-FINE-M3',
    nameAr: 'رمل ناعم (متر مكعب)',
    nameEn: 'Fine Sand (Cubic Meter)',
    descriptionAr: 'رمل ناعم للبناء والمحارة، متر مكعب واحد.',
    descriptionEn: 'Fine sand for construction and plastering, one cubic meter.',
    price: 350,
    images: [
      'https://images.unsplash.com/photo-1509664158656-23a6cba4c91e?w=400',
    ],
    categoryId: 'sand',
    stock: 200,
    unit: 'meter',
    specifications: {
      'النوع': 'رمل ناعم',
      'الاستخدام': 'بناء ومحارة',
    },
    rating: 4.0,
    reviewCount: 45,
    createdAt: '2024-01-11',
  },
  // Adhesive
  {
    id: 'adh-001',
    sku: 'ADH-SAVETO-25',
    nameAr: 'لاصق سيراميك سافيتو',
    nameEn: 'Saveto Ceramic Adhesive',
    descriptionAr: 'لاصق سيراميك من سافيتو، مناسب للأرضيات والحوائط. شيكارة 25 كجم.',
    descriptionEn: 'Ceramic adhesive from Saveto, suitable for floors and walls. 25 kg bag.',
    price: 120,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    ],
    categoryId: 'adhesives',
    brandId: 'saveto',
    stock: 300,
    unit: 'bag',
    specifications: {
      'الوزن': '25 كجم',
      'التغطية': '4-5 م²',
    },
    rating: 4.4,
    reviewCount: 189,
    createdAt: '2024-01-12',
  },
];

export const brands = [
  { id: 'arab-cement', nameAr: 'العربي للأسمنت', nameEn: 'Arab Cement' },
  { id: 'sinai-cement', nameAr: 'سيناء للأسمنت', nameEn: 'Sinai Cement' },
  { id: 'ezz-steel', nameAr: 'حديد عز', nameEn: 'Ezz Steel' },
  { id: 'cleopatra', nameAr: 'كليوباترا', nameEn: 'Cleopatra' },
  { id: 'jotun', nameAr: 'جوتن', nameEn: 'Jotun' },
  { id: 'scib', nameAr: 'سايب', nameEn: 'Scib' },
  { id: 'elsewedy', nameAr: 'السويدي', nameEn: 'El Sewedy' },
  { id: 'aquatherm', nameAr: 'أكواثيرم', nameEn: 'Aquatherm' },
  { id: 'bosch', nameAr: 'بوش', nameEn: 'Bosch' },
  { id: 'saveto', nameAr: 'سافيتو', nameEn: 'Saveto' },
];

// Helper functions
export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter((p) => p.categoryId === categoryId);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((p) => p.isFeatured);
};

export const getOnSaleProducts = (): Product[] => {
  return products.filter((p) => p.isOnSale);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.nameAr.includes(query) ||
      p.nameEn.toLowerCase().includes(lowerQuery) ||
      p.descriptionAr.includes(query) ||
      p.descriptionEn.toLowerCase().includes(lowerQuery)
  );
};

export const getCategoryById = (id: string): Category | undefined => {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const child = cat.children.find((c) => c.id === id);
      if (child) return child;
    }
  }
  return undefined;
};
