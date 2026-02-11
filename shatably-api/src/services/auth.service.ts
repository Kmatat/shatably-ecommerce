import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import otpService from './otp.service';

// Get JWT secret with validation
const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must be set and at least 32 characters long');
    }
    return secret;
};

class AuthService {
    /**
     * Register a new user
     */
    async register(data: any) {
        const { phone, password, name, email, type } = data;

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
        const token = this.generateToken(user);

        return {
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
        };
    }

    /**
     * Login user
     */
    async login(data: any) {
        const { phone, password } = data;

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
        const token = this.generateToken(user);

        return {
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
                hasPassword: true, // legacy helper
            },
        };
    }

    /**
     * Forgot Password
     */
    async forgotPassword(email: string) {
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success to prevent email enumeration
        if (!user) {
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
    }

    /**
     * Reset Password
     */
    async resetPassword(data: any) {
        const { token, password } = data;

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
    }

    /**
     * Change Password
     */
    async changePassword(userId: string, data: any) {
        const { currentPassword, newPassword } = data;

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
    }

    /**
     * Verify Email
     */
    async verifyEmail(token: string) {
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
    }

    /**
     * Resend Verification
     */
    async resendVerification(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
    }

    /**
     * Get Current User (Me)
     */
    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
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

        return user;
    }

    /**
     * Update Profile
     */
    async updateProfile(userId: string, data: any) {
        const { name, email, type, languagePreference } = data;

        // If email is being changed, check if it's already in use
        if (email) {
            const existingEmail = await prisma.user.findFirst({
                where: {
                    email,
                    id: { not: userId },
                },
            });
            if (existingEmail) {
                throw new AppError('Email already in use', 400);
            }
        }

        // Check if email is being changed
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
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
            where: { id: userId },
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

        return {
            user,
            emailChanged,
        };
    }

    /**
     * Delete Account
     */
    async deleteAccount(userId: string) {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });
    }

    // --- Helper Methods ---

    private generateToken(user: any): string {
        return jwt.sign(
            {
                userId: user.id,
                phone: user.phone,
                email: user.email,
                role: user.role,
            },
            getJwtSecret(),
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
        );
    }
}

export default new AuthService();
