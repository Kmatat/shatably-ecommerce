import { Request, Response, NextFunction } from 'express';
import cartService from '../services/cart.service';

export class CartController {

    getCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cart = await cartService.getCart(req.user!.id);
            res.json({
                success: true,
                data: cart,
            });
        } catch (error) {
            next(error);
        }
    };

    addItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { productId, quantity } = req.body;
            const updatedCart = await cartService.addItem(req.user!.id, productId, quantity);

            res.json({
                success: true,
                message: 'Item added to cart',
                data: {
                    itemCount: updatedCart.itemCount,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    updateItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { productId } = req.params;
            const { quantity } = req.body;

            await cartService.updateItem(req.user!.id, productId, quantity);

            res.json({
                success: true,
                message: 'Cart updated',
            });
        } catch (error) {
            next(error);
        }
    };

    removeItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { productId } = req.params;

            await cartService.removeItem(req.user!.id, productId);

            res.json({
                success: true,
                message: 'Item removed from cart',
            });
        } catch (error) {
            next(error);
        }
    };

    clearCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await cartService.clearCart(req.user!.id);

            res.json({
                success: true,
                message: 'Cart cleared',
            });
        } catch (error) {
            next(error);
        }
    };

    applyPromo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { code } = req.body;
            const promo = await cartService.applyPromo(req.user!.id, code);

            res.json({
                success: true,
                message: 'Promo code applied',
                data: promo,
            });
        } catch (error) {
            next(error);
        }
    };

    removePromo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await cartService.removePromo(req.user!.id);

            res.json({
                success: true,
                message: 'Promo code removed',
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new CartController();
