import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  Check,
} from 'lucide-react';
import { Header, Footer, ProductCard } from '@/components';
import { useCartStore, useLanguageStore, useUIStore } from '@/lib/store';
import { getProductById, products, getCategoryById } from '@/lib/data';
import { formatPrice, cn, getUnitLabel } from '@/lib/utils';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { language } = useLanguageStore();
  const { addItem } = useCartStore();
  const { showNotification } = useUIStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  const product = getProductById(id as string);

  if (!product) {
    return (
      <>
        <Header />
        <div className="container-custom py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
          </h1>
          <Link href="/" className="btn-primary">
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;
  const category = getCategoryById(product.categoryId);
  const categoryName = category ? (language === 'ar' ? category.nameAr : category.nameEn) : '';

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    showNotification(
      language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart',
      'success'
    );
  };

  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 5);

  const content = {
    ar: {
      addToCart: 'أضف للسلة',
      buyNow: 'اشتري الآن',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      quantity: 'الكمية',
      unit: 'الوحدة',
      sku: 'كود المنتج',
      category: 'الفئة',
      brand: 'العلامة التجارية',
      description: 'الوصف',
      specs: 'المواصفات',
      reviews: 'التقييمات',
      delivery: 'توصيل سريع خلال 3 ساعات',
      guarantee: 'ضمان الجودة',
      returns: 'إرجاع خلال 7 أيام',
      related: 'منتجات مشابهة',
      share: 'مشاركة',
      wishlist: 'أضف للمفضلة',
    },
    en: {
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      quantity: 'Quantity',
      unit: 'Unit',
      sku: 'SKU',
      category: 'Category',
      brand: 'Brand',
      description: 'Description',
      specs: 'Specifications',
      reviews: 'Reviews',
      delivery: 'Express delivery within 3 hours',
      guarantee: 'Quality Guarantee',
      returns: 'Returns within 7 days',
      related: 'Related Products',
      share: 'Share',
      wishlist: 'Add to Wishlist',
    },
  };

  const t = content[language];

  return (
    <>
      <Head>
        <title>{name} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
        <meta name="description" content={description} />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container-custom py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary-600">
                {language === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              <span>/</span>
              <Link href={`/category/${product.categoryId}`} className="hover:text-primary-600">
                {categoryName}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{name}</span>
            </nav>
          </div>
        </div>

        {/* Product Details */}
        <div className="container-custom py-8">
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Images */}
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                  <Image
                    src={product.images[selectedImage]}
                    alt={name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {hasDiscount && (
                    <span className="absolute top-4 start-4 bg-red-500 text-white px-3 py-1 rounded-full font-medium">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          'relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                          selectedImage === index ? 'border-primary-500' : 'border-transparent'
                        )}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                {/* Title & Rating */}
                <div className="mb-4">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {name}
                  </h1>
                  {product.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-5 h-5',
                              star <= Math.round(product.rating!)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600">
                        {product.rating} ({product.reviewCount} {language === 'ar' ? 'تقييم' : 'reviews'})
                      </span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary-600">
                      {formatPrice(product.price, language)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.originalPrice!, language)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 mt-1">
                    {t.unit}: {getUnitLabel(product.unit, language)}
                  </p>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      {t.inStock} ({product.stock} {language === 'ar' ? 'متاح' : 'available'})
                    </span>
                  ) : (
                    <span className="text-red-600">{t.outOfStock}</span>
                  )}
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.quantity}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center font-medium focus:outline-none"
                        min="1"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 hover:bg-gray-100"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-gray-600">
                      {t.unit}: {formatPrice(product.price * quantity, language)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 btn-primary py-3 text-lg"
                  >
                    <ShoppingCart className="w-5 h-5 me-2" />
                    {t.addToCart}
                  </button>
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <Truck className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                    <p className="text-xs text-gray-600">{t.delivery}</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                    <p className="text-xs text-gray-600">{t.guarantee}</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="w-6 h-6 mx-auto text-primary-600 mb-2" />
                    <p className="text-xs text-gray-600">{t.returns}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-6 pt-6 border-t space-y-2 text-sm">
                  <p><span className="text-gray-500">{t.sku}:</span> {product.sku}</p>
                  <p><span className="text-gray-500">{t.category}:</span> {categoryName}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-12">
              <div className="border-b">
                <div className="flex gap-8">
                  {(['description', 'specs', 'reviews'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'pb-4 font-medium transition-colors relative',
                        activeTab === tab
                          ? 'text-primary-600'
                          : 'text-gray-500 hover:text-gray-900'
                      )}
                    >
                      {t[tab]}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-6">
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                  </div>
                )}

                {activeTab === 'specs' && product.specifications && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <p className="text-gray-500">
                    {language === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.related}</h2>
              <div className="product-grid">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
