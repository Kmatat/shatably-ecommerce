# Shatably API | شطابلي

**Backend API for Shatably Building Materials eCommerce Platform**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use Supabase free tier)

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database URL and secrets

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

The API will be running at `http://localhost:3001`

## 💰 Cost-Effective Production Setup

### Recommended Free/Cheap Services

| Service | Provider | Cost |
|---------|----------|------|
| **Database** | [Supabase](https://supabase.com) | Free (500MB) |
| **Hosting** | [Railway](https://railway.app) | $5/mo |
| **File Storage** | [Cloudinary](https://cloudinary.com) | Free (25GB) |
| **SMS** | [Unifonic](https://unifonic.com) | ~0.02 EGP/SMS |
| **Domain** | Namecheap | ~$10/year |

**Total: ~$5-10/month to start**

### Alternative Hosting Options
- **Render.com** - Free tier available
- **Fly.io** - Free tier available
- **DigitalOcean** - $4/mo droplet

## 📁 Project Structure

```
shatably-api/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── config/
│   │   └── database.ts    # Prisma client
│   ├── middleware/
│   │   ├── auth.ts        # JWT authentication
│   │   ├── errorHandler.ts
│   │   └── validate.ts    # Zod validation
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── order.routes.ts
│   │   ├── address.routes.ts
│   │   ├── materialList.routes.ts
│   │   ├── admin.routes.ts
│   │   └── upload.routes.ts
│   ├── services/
│   │   └── sms.service.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── scripts/
│   │   └── seed.ts
│   └── index.ts           # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔗 API Endpoints

### Authentication
```
POST /api/auth/send-otp     - Send OTP to phone
POST /api/auth/verify-otp   - Verify OTP & login
GET  /api/auth/me           - Get current user
PUT  /api/auth/profile      - Update profile
```

### Products
```
GET  /api/products          - List products (with filters)
GET  /api/products/featured - Featured products
GET  /api/products/deals    - Products on sale
GET  /api/products/:id      - Product details
GET  /api/products/search/:q- Search products
```

### Categories
```
GET  /api/categories        - All categories (hierarchical)
GET  /api/categories/flat   - All categories (flat)
GET  /api/categories/:id    - Category details
```

### Cart
```
GET    /api/cart            - Get cart
POST   /api/cart/items      - Add item
PUT    /api/cart/items/:id  - Update quantity
DELETE /api/cart/items/:id  - Remove item
DELETE /api/cart            - Clear cart
POST   /api/cart/promo      - Apply promo code
DELETE /api/cart/promo      - Remove promo code
```

### Orders
```
GET  /api/orders            - List user's orders
GET  /api/orders/:id        - Order details
POST /api/orders            - Create order
POST /api/orders/:id/cancel - Cancel order
```

### Addresses
```
GET    /api/addresses       - List addresses
POST   /api/addresses       - Add address
PUT    /api/addresses/:id   - Update address
DELETE /api/addresses/:id   - Delete address
```

### Material Lists
```
GET    /api/material-lists     - List user's material lists
POST   /api/material-lists     - Submit material list
GET    /api/material-lists/:id - Get list details
DELETE /api/material-lists/:id - Delete list
```

### Admin (requires admin role)
```
GET   /api/admin/dashboard       - Dashboard stats
GET   /api/admin/orders          - All orders
PATCH /api/admin/orders/:id/status - Update order status
GET   /api/admin/products        - All products
POST  /api/admin/products        - Create product
PUT   /api/admin/products/:id    - Update product
DELETE /api/admin/products/:id   - Delete product
GET   /api/admin/material-lists  - All material lists
PATCH /api/admin/material-lists/:id - Update list status
POST  /api/admin/categories      - Create category
PUT   /api/admin/categories/:id  - Update category
GET   /api/admin/promo-codes     - All promo codes
POST  /api/admin/promo-codes     - Create promo code
```

### File Upload
```
POST /api/upload/image        - Upload single image
POST /api/upload/images       - Upload multiple images
POST /api/upload/material-list - Upload material list file
```

## 🔐 Authentication

The API uses JWT tokens. Include the token in requests:

```
Authorization: Bearer <token>
```

## 🌐 CORS

Configured for frontend at `http://localhost:3000` by default.
Update `FRONTEND_URL` in `.env` for production.

## 📱 SMS Integration

By default, OTP codes are logged to console. For production:

1. Sign up at [Unifonic](https://unifonic.com)
2. Get your App SID
3. Add to `.env`:
   ```
   SMS_PROVIDER=unifonic
   UNIFONIC_APP_SID=your_app_sid
   UNIFONIC_SENDER_ID=Shatably
   ```

## 🗄️ Database

### Using Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the URI and add to `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

### Using Railway
1. Create account at [railway.app](https://railway.app)
2. New Project → Add PostgreSQL
3. Copy connection string to `.env`

## 🚀 Deployment

### Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL
railway add

# Deploy
railway up
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `PORT` | Server port (default: 3001) | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `SMS_PROVIDER` | SMS provider (console/unifonic) | No |
| `UNIFONIC_APP_SID` | Unifonic App SID | For SMS |

## 📝 License

Proprietary - All rights reserved

---

Built with ❤️ for Egypt's construction industry
