# Shatably | شطابلي

**Building Materials eCommerce Platform for Egypt**

منصة التجارة الإلكترونية لمواد البناء في مصر

---

## 🏗️ About

Shatably is a comprehensive eCommerce platform for building materials in Egypt. It provides homeowners, contractors, and interior designers with easy access to quality building materials with fast delivery.

## ✨ Features

### Customer Features
- 🌐 **Bilingual Support** - Full Arabic (RTL) and English support
- 🔍 **Smart Search** - Search in both Arabic and English
- 🛒 **Shopping Cart** - Persistent cart with real-time updates
- 📋 **Material List Upload** - Upload your material list and our team prepares your cart
- 📍 **Multiple Addresses** - Save up to 10 delivery addresses
- 🚚 **Flexible Delivery** - Express (3-hour) or scheduled delivery
- 💳 **Multiple Payment Options** - Card, Fawry, Cash on Delivery

### Product Categories
- 🏗️ Structural Materials (Cement, Steel, Bricks)
- 🎨 Finishing Materials (Tiles, Paints, Gypsum)
- 🚿 Plumbing (Pipes, Faucets, Sanitary Ware)
- 💡 Electrical (Wiring, Switches, Lighting)
- 🔧 Tools & Hardware
- 🚪 Doors & Windows

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with RTL support)
- **State Management:** Zustand
- **i18n:** react-i18next
- **Icons:** Lucide React

## 📁 Project Structure

```
shatably-web/
├── src/
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── HeroSection.tsx
│   │   ├── CategorySection.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── UploadListBanner.tsx
│   │   └── CartSidebar.tsx
│   ├── pages/           # Next.js pages
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   └── index.tsx
│   ├── lib/             # Utilities and stores
│   │   ├── store.ts     # Zustand stores
│   │   ├── data.ts      # Mock data
│   │   └── utils.ts     # Helper functions
│   ├── locales/         # Translations
│   │   ├── ar.json      # Arabic
│   │   ├── en.json      # English
│   │   └── i18n.ts      # i18n config
│   ├── styles/          # Global styles
│   │   └── globals.css
│   └── types/           # TypeScript types
│       └── index.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project
cd shatably-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📱 Pages Built

### Customer Pages (10 pages)
- [x] **Homepage** `/` - Hero, categories, featured products, deals
- [x] **Product Detail** `/product/[id]` - Images, specs, reviews, related
- [x] **Category Listing** `/category/[id]` - Products grid, filters, sorting
- [x] **All Categories** `/categories` - Browse all categories
- [x] **Shopping Cart** `/cart` - Cart management, promo codes
- [x] **Checkout** `/checkout` - 3-step: Address → Delivery → Payment
- [x] **Upload List** `/upload-list` - Drag & drop file upload
- [x] **Orders List** `/orders` - Orders with status badges
- [x] **Order Detail** `/orders/[id]` - Tracking timeline, driver info
- [x] **Account** `/account` - Profile, addresses, settings

### Admin Portal (6 pages)
- [x] **Dashboard** `/admin` - Stats, recent orders, quick actions
- [x] **Orders** `/admin/orders` - Manage all orders
- [x] **Products** `/admin/products` - Add/edit/delete products
- [x] **Material Lists** `/admin/material-lists` - Review uploaded lists
- [x] **Settings** `/admin/settings` - Store configuration

## 📦 Components Built (11 components)

- **Header** - Logo, search, language toggle, cart, navigation
- **Footer** - Links, contact info, newsletter, social media
- **HeroSection** - Main banner with CTAs and features
- **CategorySection** - Category grid with icons
- **ProductCard** - 3 variants (grid/compact/horizontal)
- **FeaturedProducts** - Featured & deals sections
- **UploadListBanner** - CTA for material list upload
- **CartSidebar** - Slide-out cart drawer
- **AuthModal** - Login/Register with OTP flow
- **AdminLayout** - Admin sidebar navigation

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key
```

### Tailwind RTL

The project uses CSS logical properties for automatic RTL/LTR support. The direction is set based on the selected language.

## 📦 State Management

Using Zustand for state management:

- **useCartStore** - Shopping cart state
- **useAuthStore** - Authentication state
- **useLanguageStore** - Language/direction preference
- **useAddressStore** - User addresses
- **useUIStore** - UI state (modals, notifications)

## 🌐 Internationalization

Translations are stored in `/src/locales/`:
- `ar.json` - Arabic translations
- `en.json` - English translations

To add a new translation key:
1. Add to both JSON files
2. Use with `t('key.path')` hook

## 🎨 Design System

### Colors
- **Primary:** Blue (#2563eb)
- **Secondary:** Orange (#f97316)
- **Accent:** Green (#22c55e)

### Typography
- Arabic: Cairo, Tajawal
- English: Inter

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for Egypt's construction industry
