import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';

export class AuthController {

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.login(req.body);
            res.json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authService.forgotPassword(req.body.email);
            res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link will be sent',
            });
        } catch (error) {
            next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authService.resetPassword(req.body);
            res.json({
                success: true,
                message: 'Password reset successful. You can now login with your new password.',
            });
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authService.changePassword(req.user!.id, req.body);
            res.json({
                success: true,
                message: 'Password changed successfully',
            });
        } catch (error) {
            next(error);
        }
    };

    verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authService.verifyEmail(req.body.token);
            res.json({
                success: true,
                message: 'Email verified successfully',
            });
        } catch (error) {
            next(error);
        }
    };

    resendVerification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authService.resendVerification(req.user!.id);
            res.json({
                success: true,
                message: 'Verification email sent',
            });
        } catch (error) {
            next(error);
        }
    };

    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await authService.getMe(req.user!.id);
            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.updateProfile(req.user!.id, req.body);
            res.json({
                success: true,
                message: result.emailChanged
                    ? 'Profile updated. Please verify your new email address.'
                    : 'Profile updated successfully',
                data: result.user,
            });
        } catch (error) {
            next(error);
        }
    };

    deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authService.deleteAccount(req.user!.id);
            res.json({
                success: true,
                message: 'Account deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new AuthController();
