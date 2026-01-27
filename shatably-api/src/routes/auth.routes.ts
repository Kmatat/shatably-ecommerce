import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateOtp, validateEgyptPhone } from '../utils/helpers';
import otpService from '../services/otp.service';

const router = Router();

// Check if using email-based OTP
const isEmailOtp = () => otpService.getProviderType() === 'email';

// Validation schemas - support both phone and email based on OTP provider
const sendOtpSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
}).refine((data) => {
  // Require at least phone or email
  return !!data.email || !!data.phone;
}, {
  message: 'Either email or phone is required',
}).refine((data) => {
  // If phone provided, validate it
  if (data.phone && !validateEgyptPhone(data.phone)) {
    return false;
  }
  return true;
}, {
  message: 'Invalid Egyptian phone number',
});

const verifyOtpSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  code: z.string().length(6),
}).refine((data) => {
  return !!data.email || !!data.phone;
}, {
  message: 'Either email or phone is required',
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  type: z.enum(['homeowner', 'contractor', 'designer', 'worker']).optional(),
  languagePreference: z.enum(['ar', 'en']).optional(),
});

// Password schemas
const setPasswordSchema = z.object({
  password: z.string().min(6).max(100),
});

const loginPasswordSchema = z.object({
  phone: z.string().refine((val) => validateEgyptPhone(val), {
    message: 'Invalid Egyptian phone number',
  }),
  password: z.string().min(1),
});

/**
 * GET /api/auth/otp-config
 * Get OTP provider configuration
 */
router.get('/otp-config', (req, res) => {
  const providerType = otpService.getProviderType();
  res.json({
    success: true,
    data: {
      provider: providerType,
      requiresEmail: providerType === 'email',
      requiresPhone: providerType === 'sms',
    },
  });
});

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number or email
 */
router.post('/send-otp', validateBody(sendOtpSchema), async (req, res, next) => {
  try {
    const { phone, email } = req.body;
    const providerType = otpService.getProviderType();

    // Determine the recipient based on provider type
    let recipient: string;
    if (providerType === 'email') {
      if (!email) {
        throw new AppError('Email is required for email OTP', 400);
      }
      recipient = email;
    } else {
      if (!phone) {
        throw new AppError('Phone number is required for SMS OTP', 400);
      }
      recipient = phone;
    }

    // Generate OTP
    const code = generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check if user exists (by phone or email)
    let user = null;
    if (phone) {
      user = await prisma.user.findUnique({ where: { phone } });
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    // Create OTP record
    await prisma.otpCode.create({
      data: {
        phone: phone || email, // Store email in phone field if no phone (backward compatible)
        code,
        expiresAt,
        userId: user?.id,
      },
    });

    // Send OTP
    const sent = await otpService.sendOtp(recipient, code);
    if (!sent) {
      throw new AppError('Failed to send OTP. Please try again.', 500);
    }

    res.json({
      success: true,
      message: providerType === 'email' ? 'OTP sent to your email' : 'OTP sent to your phone',
      data: {
        phone: phone || undefined,
        email: email || undefined,
        method: providerType,
        expiresIn: 300, // 5 minutes in seconds
        isNewUser: !user,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and login/register user
 */
router.post('/verify-otp', validateBody(verifyOtpSchema), async (req, res, next) => {
  try {
    const { phone, email, code } = req.body;
    const providerType = otpService.getProviderType();

    // Determine the identifier (phone field stores both phone and email for backward compatibility)
    const identifier = phone || email;
    if (!identifier) {
      throw new AppError('Phone or email is required', 400);
    }

    // Find valid OTP
    const otp = await prisma.otpCode.findFirst({
      where: {
        phone: identifier,
        code,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Mark OTP as verified
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    // Find or create user
    let user = null;
    if (phone) {
      user = await prisma.user.findUnique({ where: { phone } });
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    const isNewUser = !user;

    if (!user) {
      // Create new user
      const userData: {
        phone: string;
        email?: string;
        role: 'customer';
        type: 'homeowner';
      } = {
        phone: phone || `email_${Date.now()}`, // Generate placeholder if phone not provided
        role: 'customer',
        type: 'homeowner',
      };

      if (email) {
        userData.email = email;
      }

      user = await prisma.user.create({ data: userData });

      // Create cart for new user
      await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      } as jwt.SignOptions
    );

    // Check if user needs to set password (new users or users without password)
    const requiresPassword = isNewUser || !user.password;

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          type: user.type,
          role: user.role,
          languagePreference: user.languagePreference,
          hasPassword: !!user.password,
        },
        isNewUser,
        requiresPassword,
        method: providerType,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/set-password
 * Set password after OTP verification (for new users or password reset)
 */
router.post('/set-password', authenticate, validateBody(setPasswordSchema), async (req, res, next) => {
  try {
    const { password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with password
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        password: hashedPassword,
        passwordSetAt: new Date(),
      },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        type: true,
        role: true,
        languagePreference: true,
      },
    });

    res.json({
      success: true,
      message: 'Password set successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login-password
 * Login with phone number and password
 */
router.post('/login-password', validateBody(loginPasswordSchema), async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new AppError('Invalid phone number or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    if (!user.password) {
      throw new AppError('Password not set. Please login with OTP first.', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid phone number or password', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      } as jwt.SignOptions
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          type: user.type,
          role: user.role,
          languagePreference: user.languagePreference,
          hasPassword: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        type: true,
        role: true,
        avatar: true,
        languagePreference: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, validateBody(updateProfileSchema), async (req, res, next) => {
  try {
    const { name, email, type, languagePreference } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(type && { type }),
        ...(languagePreference && { languagePreference }),
      },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        type: true,
        role: true,
        avatar: true,
        languagePreference: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/auth/account
 * Delete user account (soft delete)
 */
router.delete('/account', authenticate, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
