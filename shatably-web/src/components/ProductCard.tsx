'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, ImageOff } from 'lucide-react';
import { useCartStore, useLanguageStore, useUIStore } from '@/lib/store';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { language } = useLanguageStore();
  const { addItem } = useCartStore();
  const { showNotification } = useUIStore();
  const [imageError, setImageError] = useState(false);

  const name = language === 'ar' ? product.nameAr : product.nameEn;

  // Handle both string URLs and object format { url: string }
  const getImageUrl = (): string | null => {
    if (imageError) return null;
    if (!product.images || product.images.length === 0) return null;
    const firstImage = product.images[0];
    if (!firstImage) return null;
    // Handle case where image might be an object with url property
    const url = typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url;
    if (!url || url === '') return null;
    return url;
  };

  const imageUrl = getImageUrl();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    showNotification(
      language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart',
      'success'
    );
  };

  // Placeholder component for when image fails to load
  const ImagePlaceholder = () => (
    <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
      <ImageOff className="w-12 h-12 mb-2" />
      <span className="text-xs text-center px-2">{language === 'ar' ? 'لا توجد صورة' : 'No Image'}</span>
    </div>
  );

  if (variant === 'horizontal') {
    return (
      <Link href={`/product/${product.id}`}>
        <div className="card flex gap-4 p-4 hover:shadow-lg transition-shadow">
          <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImagePlaceholder />
            )}
            {hasDiscount && (
              <span className="absolute top-2 start-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                -{discountPercent}%
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">{name}</h3>
            {product.rating && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(product.price, language)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice!, language)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="self-center p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.id}`}>
      <div className={cn(
        'card group',
        variant === 'compact' ? 'p-2' : 'p-4'
      )}>
        {/* Image */}
        <div className={cn(
          'relative overflow-hidden rounded-lg mb-3 bg-gray-100',
          variant === 'compact' ? 'aspect-square' : 'aspect-[4/3]'
        )}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <ImagePlaceholder />
          )}

          {/* Badges */}
          <div className="absolute top-2 start-2 flex flex-col gap-1 z-10">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                -{discountPercent}%
              </span>
            )}
            {product.isFeatured && !hasDiscount && (
              <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {language === 'ar' ? 'مميز' : 'Featured'}
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
            >
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                {language === 'ar' ? 'غير متوفر' : 'Out of Stock'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className={cn(
            'font-medium text-gray-900 line-clamp-2 mb-2',
            variant === 'compact' ? 'text-sm' : 'text-base'
          )}>
            {name}
          </h3>

          {/* Rating */}
          {product.rating && variant !== 'compact' && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">
                {product.rating}
              </span>
              <span className="text-sm text-gray-400">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className={cn(
                'font-bold text-primary-600',
                variant === 'compact' ? 'text-base' : 'text-lg'
              )}>
                {formatPrice(product.price, language)}
              </span>
              {hasDiscount && (
                <span className="block text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice!, language)}
                </span>
              )}
            </div>

            {variant !== 'compact' && product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
