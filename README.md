# Shatably | شطابلي

<div align="center">

![Shatably Logo](https://placehold.co/200x80/2563eb/white?text=شطابلي)

**Egypt's Premier Building Materials eCommerce Platform**

منصة التجارة الإلكترونية لمواد البناء في مصر

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)]()

</div>

---

## 🏗️ Overview

Shatably is a full-stack eCommerce platform designed for the Egyptian building materials market. It connects homeowners, contractors, and interior designers with quality building materials through a modern, bilingual interface.

### Key Features

- 🌐 **Bilingual** - Full Arabic (RTL) and English support
- 📱 **Responsive** - Works on all devices
- 📋 **Material List Upload** - Upload material lists, get ready carts
- 🚚 **Flexible Delivery** - Express (3-hour) or scheduled delivery
- 💳 **Multiple Payments** - Card, Fawry, Cash on Delivery
- 👥 **Multi-Role** - Homeowner, Contractor, Designer accounts

---

## 📁 Project Structure

```
shatably/
├── shatably-web/          # Frontend (Next.js)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Next.js pages
│   │   ├── lib/           # Utilities & state
│   │   ├── locales/       # Translations
│   │   └── styles/        # Global CSS
│   └── package.json
│
└── shatably-api/          # Backend (Express)
    ├── prisma/            # Database schema
    ├── src/
    │   ├── routes/        # API endpoints
    │   ├── middleware/    # Auth, validation
    │   ├── services/      # SMS, etc.
    │   └── utils/         # Helpers
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or [Supabase](https://supabase.com) free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shatably.git
cd shatably
```

### 2. Setup Backend API

```bash
cd shatably-api

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Setup database
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Start server
npm run dev
```

API runs at `http://localhost:3001`

### 3. Setup Frontend

```bash
cd shatably-web

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 💰 Production Deployment (Budget-Friendly)

| Service | Provider | Cost |
|---------|----------|------|
| Database | [Supabase](https://supabase.com) | **Free** |
| API Hosting | [Railway](https://railway.app) | ~$5/mo |
| Frontend | [Vercel](https://vercel.com) | **Free** |
| File Storage | [Cloudinary](https://cloudinary.com) | **Free** |
| SMS | [Unifonic](https://unifonic.com) | ~$0.01/SMS |

**Total: ~$5/month to start**

### Deploy to Railway (API)

```bash
cd shatably-api
npm install -g @railway/cli
railway login
railway init
railway up
```

### Deploy to Vercel (Frontend)

```bash
cd shatably-web
npm install -g vercel
vercel
```

---

## 📱 Pages & Features

### Customer Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, categories, featured products |
| Products | `/category/[id]` | Product listing with filters |
| Product | `/product/[id]` | Product details & reviews |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | 3-step checkout |
| Orders | `/orders` | Order history |
| Order Detail | `/orders/[id]` | Order tracking |
| Account | `/account` | Profile & settings |
| Upload List | `/upload-list` | Material list upload |

### Admin Portal
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Stats & overview |
| Orders | `/admin/orders` | Order management |
| Products | `/admin/products` | Product CRUD |
| Material Lists | `/admin/material-lists` | Process uploads |
| Settings | `/admin/settings` | Store configuration |

---

## 🔗 API Endpoints

### Public
- `GET /api/products` - List products
- `GET /api/categories` - List categories
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify & login

### Authenticated
- `GET /api/cart` - Get cart
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `POST /api/addresses` - Add address

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `PATCH /api/admin/orders/:id/status` - Update order
- `POST /api/admin/products` - Create product

See full API documentation in `shatably-api/README.md`

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS (RTL support)
- **State:** Zustand
- **i18n:** react-i18next
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Auth:** JWT

---

## 🔐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
SMS_PROVIDER=console
```

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

Proprietary - All rights reserved

---

## 🤝 Support

For support, email support@shatably.com

---

<div align="center">

**Built with ❤️ for Egypt's construction industry**

</div>
