import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import brandRoutes from './routes/brand.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import addressRoutes from './routes/address.routes';
import materialListRoutes from './routes/materialList.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';
import settingsRoutes from './routes/settings.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://shatably-ecommerce-six.vercel.app',
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // Remove trailing slash if present
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    // Check if origin is in allowed list (without trailing slashes)
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.some(allowed => allowed === normalizedOrigin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Database connection diagnostic
app.get('/api/db-check', async (req, res) => {
  const prisma = (await import('./config/database')).default;
  try {
    // Try a simple query
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'Database connected successfully',
      dbUrl: process.env.DATABASE_URL ?
        process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'NOT SET'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      dbUrl: process.env.DATABASE_URL ?
        process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'NOT SET'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/material-lists', materialListRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Shatably API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
