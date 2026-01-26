'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore, useUIStore, useLanguageStore } from '@/lib/store';
import { formatPrice, cn } from '@/lib/utils';

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const { isCartOpen, toggleCart } = useUIStore();
  const { language } = useLanguageStore();

  const subtotal = getSubtotal();

  const content = {
    ar: {
      title: 'سلة التسوق',
      empty: 'سلتك فارغة',
      emptyDesc: 'ابدأ بإضافة منتجات لسلتك',
      continueShopping: 'تابع التسوق',
      subtotal: 'المجموع الفرعي',
      checkout: 'إتمام الطلب',
      viewCart: 'عرض السلة',
    },
    en: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptyDesc: 'Start adding products to your cart',
      continueShopping: 'Continue Shopping',
      subtotal: 'Subtotal',
      checkout: 'Checkout',
      viewCart: 'View Cart',
    },
  };

  const t = content[language];

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={toggleCart}
      />

      {/* Sidebar */}
      <div className={cn(
        'fixed top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col',
        language === 'ar' ? 'left-0' : 'right-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.title}</h2>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.empty}</h3>
            <p className="text-gray-500 mb-6">{t.emptyDesc}</p>
            <button
              onClick={toggleCart}
              className="btn-primary"
            >
              {t.continueShopping}
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => {
                const name = language === 'ar' ? item.product.nameAr : item.product.nameEn;
                return (
                  <div key={item.productId} className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {name}
                      </h4>
                      <p className="text-primary-600 font-semibold mt-1">
                        {formatPrice(item.unitPrice, language)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium">{t.subtotal}</span>
                <span className="font-bold text-primary-600">
                  {formatPrice(subtotal, language)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={toggleCart}
                  className="btn-outline text-center"
                >
                  {t.viewCart}
                </Link>
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="btn-primary text-center"
                >
                  {t.checkout}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
