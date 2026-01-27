import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, User, Address } from '@/types';

// Cart Store
interface CartState {
  items: CartItem[];
  promoCode: string | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,

      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                product,
                quantity,
                unitPrice: product.price,
              },
            ],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], promoCode: null });
      },

      applyPromoCode: (code: string) => {
        set({ promoCode: code });
      },

      removePromoCode: () => {
        set({ promoCode: null });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.unitPrice * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'shatably-cart',
    }
  )
);

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      getToken: () => get().token,
    }),
    {
      name: 'shatably-auth',
    }
  )
);

// Address Store
interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
  selectAddress: (addressId: string) => void;
  getDefaultAddress: () => Address | undefined;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,

      setAddresses: (addresses: Address[]) => {
        set({ addresses });
      },

      addAddress: (address: Address) => {
        set((state) => ({
          addresses: [...state.addresses, address],
        }));
      },

      updateAddress: (address: Address) => {
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === address.id ? address : a
          ),
        }));
      },

      removeAddress: (addressId: string) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== addressId),
        }));
      },

      selectAddress: (addressId: string) => {
        set({ selectedAddressId: addressId });
      },

      getDefaultAddress: () => {
        return get().addresses.find((a) => a.isDefault);
      },
    }),
    {
      name: 'shatably-addresses',
    }
  )
);

// UI Store (for modals, notifications, etc.)
interface UIState {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  notification: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  isAuthModalOpen: false,
  authModalTab: 'login',
  notification: null,

  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },

  toggleCart: () => {
    set((state) => ({ isCartOpen: !state.isCartOpen }));
  },

  toggleSearch: () => {
    set((state) => ({ isSearchOpen: !state.isSearchOpen }));
  },

  openAuthModal: (tab = 'login') => {
    set({ isAuthModalOpen: true, authModalTab: tab });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false });
  },

  showNotification: (message: string, type: 'success' | 'error' | 'info') => {
    set({ notification: { message, type } });
    // Auto-clear after 5 seconds
    setTimeout(() => {
      set({ notification: null });
    }, 5000);
  },

  clearNotification: () => {
    set({ notification: null });
  },
}));

// Language Store
interface LanguageState {
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: 'ar' | 'en') => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      direction: 'rtl',

      setLanguage: (lang: 'ar' | 'en') => {
        set({
          language: lang,
          direction: lang === 'ar' ? 'rtl' : 'ltr',
        });
        // Update HTML dir attribute
        if (typeof document !== 'undefined') {
          document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = lang;
        }
      },
    }),
    {
      name: 'shatably-language',
    }
  )
);
