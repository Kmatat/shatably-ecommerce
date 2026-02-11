import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { calculateDiscount, calculateDeliveryFee } from '../utils/helpers';
import { getDeliverySettings } from '../utils/settings';

class CartService {
    /**
     * Get user's cart with calculated totals
     */
    async getCart(userId: string) {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    orderBy: { sortOrder: 'asc' },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });

        // Create cart if doesn't exist
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: {
                                        orderBy: { sortOrder: 'asc' },
                                        take: 1,
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }

        // Calculate totals
        let subtotal = 0;
        const items = cart.items.map((item) => {
            const unitPrice = Number(item.product.price);
            const itemTotal = unitPrice * item.quantity;
            subtotal += itemTotal;

            return {
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice,
                total: itemTotal,
                product: {
                    id: item.product.id,
                    sku: item.product.sku,
                    nameAr: item.product.nameAr,
                    nameEn: item.product.nameEn,
                    price: unitPrice,
                    originalPrice: item.product.originalPrice ? Number(item.product.originalPrice) : null,
                    unit: item.product.unit,
                    stock: item.product.stock,
                    image: item.product.images[0]?.url || null,
                },
            };
        });

        // Calculate promo discount
        let discount = 0;
        let promoDetails = null;

        if (cart.promoCode) {
            const promo = await prisma.promoCode.findFirst({
                where: {
                    code: cart.promoCode,
                    isActive: true,
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                },
            });

            if (promo) {
                discount = calculateDiscount(subtotal, {
                    type: promo.type,
                    value: Number(promo.value),
                    minOrderAmount: promo.minOrderAmount ? Number(promo.minOrderAmount) : null,
                    maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : null,
                });
                promoDetails = {
                    code: promo.code,
                    type: promo.type,
                    value: Number(promo.value),
                    discount,
                };
            }
        }

        // Get dynamic delivery settings
        const settings = await getDeliverySettings();
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        const expressDeliveryFee = calculateDeliveryFee(subtotal, 'express', itemCount, settings);
        const scheduledDeliveryFee = calculateDeliveryFee(subtotal, 'scheduled', itemCount, settings);

        return {
            id: cart.id,
            items,
            itemCount,
            subtotal,
            discount,
            promo: promoDetails,
            delivery: {
                express: expressDeliveryFee,
                scheduled: scheduledDeliveryFee,
                freeThreshold: settings.freeDeliveryThreshold,
                highValueThreshold: settings.highValueThreshold,
                itemCountThreshold: settings.itemCountThreshold,
                itemCountDiscount: settings.itemCountDiscount,
            },
        };
    }

    /**
     * Add item to cart
     */
    async addItem(userId: string, productId: string, quantity: number) {
        // Check product exists and is active
        const product = await prisma.product.findFirst({
            where: { id: productId, isActive: true },
        });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Check stock
        if (product.stock < quantity) {
            throw new AppError(`Only ${product.stock} items available`, 400);
        }

        // Get or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        // Check if item already in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                variationId: null,
            },
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (product.stock < newQuantity) {
                throw new AppError(`Only ${product.stock} items available`, 400);
            }

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }

        // Return updated cart
        return this.getCart(userId);
    }

    /**
     * Update cart item quantity
     */
    async updateItem(userId: string, productId: string, quantity: number) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                variationId: null,
            },
            include: { product: true },
        });

        if (!cartItem) {
            throw new AppError('Item not in cart', 404);
        }

        // Check stock
        if (cartItem.product.stock < quantity) {
            throw new AppError(`Only ${cartItem.product.stock} items available`, 400);
        }

        await prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity },
        });
    }

    /**
     * Remove item from cart
     */
    async removeItem(userId: string, productId: string) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                productId,
            },
        });
    }

    /**
     * Clear user's cart
     */
    async clearCart(userId: string) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            await prisma.cart.update({
                where: { id: cart.id },
                data: { promoCode: null },
            });
        }
    }

    /**
     * Apply promo code
     */
    async applyPromo(userId: string, code: string) {
        // Find valid promo
        const promo = await prisma.promoCode.findFirst({
            where: {
                code: code.toUpperCase(),
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
                OR: [
                    { usageLimit: null },
                    { usedCount: { lt: prisma.promoCode.fields.usageLimit } },
                ],
            },
        });

        if (!promo) {
            throw new AppError('Invalid or expired promo code', 400);
        }

        // Update cart with promo code
        await prisma.cart.update({
            where: { userId },
            data: { promoCode: promo.code },
        });

        return {
            code: promo.code,
            type: promo.type,
            value: Number(promo.value),
        };
    }

    /**
     * Remove promo code
     */
    async removePromo(userId: string) {
        await prisma.cart.update({
            where: { userId },
            data: { promoCode: null },
        });
    }
}

export default new CartService();
