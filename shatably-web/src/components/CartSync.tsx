'use client';

import { useEffect, useRef } from 'react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { apiCall } from '@/lib/api';

export default function CartSync() {
  const { isAuthenticated, token } = useAuthStore();
  const { items, addItem, clearCart } = useCartStore();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || syncingRef.current) return;

    const syncCart = async () => {
      syncingRef.current = true;
      try {
        // 1. Fetch backend cart
        const response = await apiCall<{ items: any[] }>('/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.success && response.data) {
          const backendItems = response.data.items;
          const localItems = items;

          // If local is empty and backend has items, populate local
          if (localItems.length === 0 && backendItems.length > 0) {
            backendItems.forEach((item: any) => {
              addItem({
                id: item.product.id,
                sku: item.product.sku,
                nameAr: item.product.nameAr,
                nameEn: item.product.nameEn,
                price: item.product.price,
                originalPrice: item.product.originalPrice,
                images: item.product.image ? [item.product.image] : [],
                unit: item.product.unit,
                stock: item.product.stock,
                categoryId: '', // Placeholder as category isn't returned in cart product
                createdAt: new Date().toISOString(),
              }, item.quantity);
            });
          }
          // If local has items, push to backend (simple strategy: overwrite backend or merge?)
          // Since backend API handles increment, we can push local items.
          else if (localItems.length > 0) {
            // Push each local item to backend
            await Promise.all(localItems.map(item => 
              apiCall('/cart/items', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  productId: item.productId,
                  quantity: item.quantity
                })
              })
            ));
          }
        }
      } catch (error) {
        console.error('Cart sync failed:', error);
      } finally {
        syncingRef.current = false;
      }
    };

    syncCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]); 

  return null;
}
