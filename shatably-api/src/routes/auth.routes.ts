import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { validateEgyptPhone } from '../utils/helpers';
import authController from '../controllers/auth.controller';

const router = Router();

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
  email: z.preprocess((val) => (val === '' ? null : val), z.string().email().nullable().optional()),
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
router.post('/register', validateBody(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * Login with phone number and password
 */
router.post('/login', validateBody(loginSchema), authController.login);

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

/**
 * POST /api/auth/change-password
 * Change password (authenticated)
 */
router.post('/change-password', authenticate, validateBody(changePasswordSchema), authController.changePassword);

/**
 * POST /api/auth/verify-email
 * Verify email address with token
 */
router.post('/verify-email', validateBody(verifyEmailSchema), authController.verifyEmail);

/**
 * POST /api/auth/resend-verification
 * Resend email verification link
 */
router.post('/resend-verification', authenticate, authController.resendVerification);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, authController.getMe);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, validateBody(updateProfileSchema), authController.updateProfile);

/**
 * DELETE /api/auth/account
 * Delete user account (soft delete)
 */
router.delete('/account', authenticate, authController.deleteAccount);

// ============ LEGACY OTP ROUTES (kept for backward compatibility) ============

/**
 * POST /api/auth/login-password (legacy alias for /login)
 */
router.post('/login-password', validateBody(loginSchema), authController.login);

export default router;
