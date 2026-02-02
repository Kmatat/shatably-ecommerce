import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateEgyptPhone } from '../utils/helpers';
import otpService from '../services/otp.service';

const router = Router();

// Get JWT secret with validation
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
  }
  return secret;
};

// Validation schemas
const registerSchema = z.object({
  phone: z.string().refine((val) => validateEgyptPhone(val), {
    message: 'Invalid Egyptian phone number',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  type: z.enum(['homeowner', 'contractor', 'designer', 'worker']).optional(),
});

const loginSchema = z.object({
  phone: z.string().refine((val) => validateEgyptPhone(val), {
    message: 'Invalid Egyptian phone number',
  }),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  type: z.enum(['homeowner', 'contractor', 'designer', 'worker']).optional(),
  languagePreference: z.enum(['ar', 'en']).optional(),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

/**
 * POST /api/auth/register
 * Register a new user with phone and password
 */
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { phone, password, name, email, type } = req.body;

    // Check if phone already exists
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      throw new AppError('Phone number already registered', 400);
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        throw new AppError('Email already registered', 400);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token if email provided
    let emailVerificationToken: string | null = null;
    let emailVerificationExpires: Date | null = null;
    if (email) {
      emailVerificationToken = crypto.randomBytes(32).toString('hex');
      emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        passwordSetAt: new Date(),
        name: name || null,
        email: email || null,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
        type: type || 'homeowner',
        role: 'customer',
      },
    });

    // Create cart for new user
    await prisma.cart.create({
      data: { userId: user.id },
    });

    // Send email verification if email provided
    if (email && emailVerificationToken) {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
      // Send verification email (using OTP service for email sending)
      await otpService.sendOtp(email, `Verify your email: ${verificationUrl}`);
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          type: user.type,
          role: user.role,
          languagePreference: user.languagePreference,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login with phone number and password
 */
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      throw new AppError('Invalid phone number or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    if (!user.password) {
      throw new AppError('Please set a password first', 401);
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
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
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
          emailVerified: user.emailVerified,
          type: user.type,
          role: user.role,
          languagePreference: user.languagePreference,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent',
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const message = `
      رابط إعادة تعيين كلمة المرور: ${resetUrl}
      Password reset link: ${resetUrl}

      This link is valid for 1 hour.
      هذا الرابط صالح لمدة ساعة واحدة.
    `;

    try {
      await otpService.sendOtp(email, message);
    } catch (emailError) {
      // Clear reset token if email fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      throw new AppError('Failed to send password reset email', 500);
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hash token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordSetAt: new Date(),
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/change-password
 * Change password (authenticated)
 */
router.post('/change-password', authenticate, validateBody(changePasswordSchema), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user || !user.password) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordSetAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email address with token
 */
router.post('/verify-email', validateBody(verifyEmailSchema), async (req, res, next) => {
  try {
    const { token } = req.body;

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend email verification link
 */
router.post('/resend-verification', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.email) {
      throw new AppError('No email address associated with this account', 400);
    }

    if (user.emailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    await otpService.sendOtp(user.email, `Verify your email: ${verificationUrl}`);

    res.json({
      success: true,
      message: 'Verification email sent',
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
        emailVerified: true,
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

    // If email is being changed, check if it's already in use
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          id: { not: req.user!.id },
        },
      });
      if (existingEmail) {
        throw new AppError('Email already in use', 400);
      }
    }

    // Check if email is being changed
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    const emailChanged = email && email !== currentUser?.email;

    // Generate new verification token if email changed
    let emailVerificationToken: string | null = null;
    let emailVerificationExpires: Date | null = null;
    if (emailChanged) {
      emailVerificationToken = crypto.randomBytes(32).toString('hex');
      emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(type && { type }),
        ...(languagePreference && { languagePreference }),
        ...(emailChanged && {
          emailVerified: false,
          emailVerificationToken,
          emailVerificationExpires,
        }),
      },
      select: {
        id: true,
        phone: true,
        email: true,
        emailVerified: true,
        name: true,
        type: true,
        role: true,
        avatar: true,
        languagePreference: true,
      },
    });

    // Send verification email if email changed
    if (emailChanged && email && emailVerificationToken) {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
      await otpService.sendOtp(email, `Verify your email: ${verificationUrl}`);
    }

    res.json({
      success: true,
      message: emailChanged
        ? 'Profile updated. Please verify your new email address.'
        : 'Profile updated successfully',
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

// ============ LEGACY OTP ROUTES (kept for backward compatibility) ============

/**
 * POST /api/auth/login-password (legacy alias for /login)
 */
router.post('/login-password', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      throw new AppError('Invalid phone number or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    if (!user.password) {
      throw new AppError('Please set a password first', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid phone number or password', 401);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
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
          emailVerified: user.emailVerified,
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

export default router;
