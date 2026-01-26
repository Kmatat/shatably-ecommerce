import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateOtp, validateEgyptPhone } from '../utils/helpers';
import smsService from '../services/sms.service';

const router = Router();

// Validation schemas
const sendOtpSchema = z.object({
  phone: z.string().refine(validateEgyptPhone, {
    message: 'Invalid Egyptian phone number',
  }),
});

const verifyOtpSchema = z.object({
  phone: z.string().refine(validateEgyptPhone, {
    message: 'Invalid Egyptian phone number',
  }),
  code: z.string().length(6),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  type: z.enum(['homeowner', 'contractor', 'designer']).optional(),
  languagePreference: z.enum(['ar', 'en']).optional(),
});

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number
 */
router.post('/send-otp', validateBody(sendOtpSchema), async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const code = generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    // Create or update OTP
    await prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt,
        userId: user?.id,
      },
    });

    // Send OTP via SMS
    await smsService.sendOtp(phone, code);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
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
    const { phone, code } = req.body;

    // Find valid OTP
    const otp = await prisma.otpCode.findFirst({
      where: {
        phone,
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
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    const isNewUser = !user;

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: 'customer',
          type: 'homeowner',
        },
      });

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
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      } as jwt.SignOptions
    );

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
        },
        isNewUser,
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
