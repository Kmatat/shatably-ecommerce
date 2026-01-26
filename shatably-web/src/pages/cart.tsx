import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  Truck,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Header, Footer } from '@/components';
import { useCartStore, useLanguageStore, useUIStore } from '@/lib/store';
import { formatPrice, cn } from '@/lib/utils';

export default function CartPage() {
  const { language } = useLanguageStore();
  const { items, removeItem, updateQuantity, getSubtotal, promoCode, applyPromoCode, removePromoCode } = useCartStore();
  const { showNotification } = useUIStore();

  const [promoInput, setPromoInput] = useState('');

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 5000 ? 0 : 100; // Free delivery over 5000 EGP
  const discount = promoCode ? subtotal * 0.1 : 0; // 10% discount with promo code
  const total = subtotal + deliveryFee - discount;

  const handleApplyPromo = () => {
    if (promoInput.trim()) {
      applyPromoCode(promoInput.trim());
      showNotification(
        language === 'ar' ? 'تم تطبيق كود الخصم' : 'Promo code applied',
        'success'
      );
      setPromoInput('');
    }
  };

  const content = {
    ar: {
      title: 'سلة التسوق',
      empty: 'سلتك فارغة',
      emptyDesc: 'ابدأ بإضافة منتجات لسلتك',
      continueShopping: 'تابع التسوق',
      product: 'المنتج',
      price: 'السعر',
      quantity: 'الكمية',
      total: 'الإجمالي',
      remove: 'إزالة',
      subtotal: 'المجموع الفرعي',
      delivery: 'التوصيل',
      freeDelivery: 'مجاني',
      discount: 'الخصم',
      orderTotal: 'إجمالي الطلب',
      promoCode: 'كود الخصم',
      apply: 'تطبيق',
      checkout: 'إتمام الطلب',
      freeDeliveryNote: 'توصيل مجاني للطلبات فوق 5,000 ج.م',
      itemsCount: 'منتج',
    },
    en: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptyDesc: 'Start adding products to your cart',
      continueShopping: 'Continue Shopping',
      product: 'Product',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      remove: 'Remove',
      subtotal: 'Subtotal',
      delivery: 'Delivery',
      freeDelivery: 'Free',
      discount: 'Discount',
      orderTotal: 'Order Total',
      promoCode: 'Promo Code',
      apply: 'Apply',
      checkout: 'Checkout',
      freeDeliveryNote: 'Free delivery for orders over EGP 5,000',
      itemsCount: 'items',
    },
  };

  const t = content[language];
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <>
      <Head>
        <title>{t.title} | {language === 'ar' ? 'شطابلي' : 'Shatably'}</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {t.title}
            {items.length > 0 && (
              <span className="text-gray-500 font-normal text-lg ms-2">
                ({items.length} {t.itemsCount})
              </span>
            )}
          </h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.empty}</h2>
              <p className="text-gray-500 mb-6">{t.emptyDesc}</p>
              <Link href="/categories" className="btn-primary">
                <BackArrow className="w-5 h-5 me-2" />
                {t.continueShopping}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-100 p-4 rounded-lg font-medium text-gray-600 text-sm">
                  <div className="col-span-6">{t.product}</div>
                  <div className="col-span-2 text-center">{t.price}</div>
                  <div className="col-span-2 text-center">{t.quantity}</div>
                  <div className="col-span-2 text-center">{t.total}</div>
                </div>

                {/* Items */}
                {items.map((item) => {
                  const name = language === 'ar' ? item.product.nameAr : item.product.nameEn;
                  return (
                    <div
                      key={item.productId}
                      className="bg-white rounded-xl shadow-sm p-4 md:p-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Product */}
                        <div className="md:col-span-6 flex gap-4">
                          <Link href={`/product/${item.productId}`}>
                            <div className="relative w-24 h-24 flex-shrink-0">
                              <Image
                                src={item.product.images[0]}
                                alt={name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${item.productId}`}>
                              <h3 className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
                                {name}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.product.sku}
                            </p>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1 md:hidden"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t.remove}
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="md:col-span-2 text-center">
                          <span className="md:hidden text-gray-500 text-sm me-2">{t.price}:</span>
                          <span className="font-medium">{formatPrice(item.unitPrice, language)}</span>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2 flex items-center justify-center">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                          <span className="md:hidden text-gray-500 text-sm">{t.total}:</span>
                          <span className="font-bold text-primary-600">
                            {formatPrice(item.unitPrice * item.quantity, language)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="hidden md:block p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg ms-4"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Continue Shopping */}
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <BackArrow className="w-5 h-5" />
                  {t.continueShopping}
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  <h2 className="text-lg font-semibold mb-6">
                    {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                  </h2>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.promoCode}
                    </label>
                    {promoCode ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <Tag className="w-5 h-5" />
                          <span className="font-medium">{promoCode}</span>
                        </div>
                        <button
                          onClick={removePromoCode}
                          className="text-green-700 hover:text-green-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل الكود' : 'Enter code'}
                          className="flex-1 input"
                        />
                        <button onClick={handleApplyPromo} className="btn-outline px-4">
                          {t.apply}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.subtotal}</span>
                      <span className="font-medium">{formatPrice(subtotal, language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.delivery}</span>
                      <span className={cn('font-medium', deliveryFee === 0 && 'text-green-600')}>
                        {deliveryFee === 0 ? t.freeDelivery : formatPrice(deliveryFee, language)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t.discount}</span>
                        <span className="font-medium">-{formatPrice(discount, language)}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">{t.orderTotal}</span>
                      <span className="font-bold text-primary-600">
                        {formatPrice(total, language)}
                      </span>
                    </div>
                  </div>

                  {/* Free Delivery Note */}
                  {deliveryFee > 0 && (
                    <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-center gap-2 text-sm text-primary-700">
                      <Truck className="w-5 h-5 flex-shrink-0" />
                      <span>{t.freeDeliveryNote}</span>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="btn-primary w-full mt-6 py-3 text-lg justify-center"
                  >
                    {t.checkout}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
