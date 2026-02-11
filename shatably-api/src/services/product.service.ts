import prisma from '../config/database';
import { paginate } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

class ProductService {
    /**
     * Find all products with filtering, sorting, and pagination
     */
    async findAll(query: any) {
        const {
            page,
            limit,
            category,
            brand,
            search,
            minPrice,
            maxPrice,
            inStock,
            featured,
            sort,
        } = query;

        const { skip } = paginate({ page, limit });

        // Build where clause
        const where: any = {
            isActive: true,
        };

        if (category) {
            // Include products from subcategories too
            const categoryWithChildren = await prisma.category.findFirst({
                where: {
                    OR: [
                        { id: category },
                        { slug: category },
                    ],
                },
                include: {
                    children: {
                        select: { id: true },
                    },
                },
            });

            if (categoryWithChildren) {
                const categoryIds = [
                    categoryWithChildren.id,
                    ...categoryWithChildren.children.map((c) => c.id),
                ];
                where.categoryId = { in: categoryIds };
            }
        }

        if (brand) {
            where.brandId = brand;
        }

        if (search) {
            where.OR = [
                { nameAr: { contains: search, mode: 'insensitive' } },
                { nameEn: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }

        if (inStock) {
            where.stock = { gt: 0 };
        }

        if (featured) {
            where.isFeatured = true;
        }

        // Build order by
        let orderBy: any = { createdAt: 'desc' };
        switch (sort) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'popular':
                orderBy = { createdAt: 'desc' }; // TODO: Add sales count
                break;
            case 'rating':
                orderBy = { createdAt: 'desc' }; // TODO: Add average rating
                break;
        }

        // Fetch products
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    images: {
                        orderBy: { sortOrder: 'asc' },
                    },
                    category: {
                        select: {
                            id: true,
                            nameAr: true,
                            nameEn: true,
                            slug: true,
                        },
                    },
                    brand: {
                        select: {
                            id: true,
                            nameAr: true,
                            nameEn: true,
                            slug: true,
                        },
                    },
                    _count: {
                        select: {
                            reviews: true,
                        },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        // Transform products
        const transformedProducts = products.map((product) => ({
            id: product.id,
            sku: product.sku,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            unit: product.unit,
            stock: product.stock,
            images: product.images.map((img) => img.url),
            categoryId: product.categoryId,
            category: product.category,
            brand: product.brand,
            brandId: product.brandId,
            isFeatured: product.isFeatured,
            reviewCount: product._count.reviews,
            createdAt: product.createdAt,
        }));

        return {
            products: transformedProducts,
            total,
            page,
            limit,
        };
    }

    /**
     * Find featured products
     */
    async findFeatured() {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                isFeatured: true,
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        return products.map((product) => ({
            id: product.id,
            sku: product.sku,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            unit: product.unit,
            stock: product.stock,
            images: product.images.map((img) => img.url),
            categoryId: product.categoryId,
            isFeatured: product.isFeatured,
        }));
    }

    /**
     * Find products on deal
     */
    async findDeals() {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                originalPrice: { not: null },
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        return products.map((product) => ({
            id: product.id,
            sku: product.sku,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            unit: product.unit,
            stock: product.stock,
            images: product.images.map((img) => img.url),
            categoryId: product.categoryId,
        }));
    }

    /**
     * Search products by query string
     */
    async search(query: string, limit: number = 10) {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                OR: [
                    { nameAr: { contains: query, mode: 'insensitive' } },
                    { nameEn: { contains: query, mode: 'insensitive' } },
                    { sku: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: limit,
            include: {
                images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                },
            },
        });

        return products.map((product) => ({
            id: product.id,
            sku: product.sku,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            price: Number(product.price),
            image: product.images[0]?.url || null,
        }));
    }

    /**
     * Get all brands
     */
    async getBrands() {
        const brands = await prisma.brand.findMany({
            where: { isActive: true },
            orderBy: { nameEn: 'asc' },
        });

        return brands.map((brand) => ({
            id: brand.id,
            nameAr: brand.nameAr,
            nameEn: brand.nameEn,
            slug: brand.slug,
            logo: brand.logo,
        }));
    }

    /**
     * Find product by ID or SKU
     */
    async findById(id: string, userId?: string) {
        const product = await prisma.product.findFirst({
            where: {
                OR: [
                    { id },
                    { sku: id },
                ],
                isActive: true,
            },
            include: {
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                category: {
                    select: {
                        id: true,
                        nameAr: true,
                        nameEn: true,
                        slug: true,
                        parent: {
                            select: {
                                id: true,
                                nameAr: true,
                                nameEn: true,
                                slug: true,
                            },
                        },
                    },
                },
                brand: {
                    select: {
                        id: true,
                        nameAr: true,
                        nameEn: true,
                        slug: true,
                        logo: true,
                    },
                },
                reviews: {
                    where: { isApproved: true },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        reviews: {
                            where: { isApproved: true },
                        },
                    },
                },
            },
        });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Calculate average rating
        const avgRating = product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
            : null;

        // Check if in user's wishlist
        let isInWishlist = false;
        if (userId) {
            const wishlistItem = await prisma.wishlist.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId: product.id,
                    },
                },
            });
            isInWishlist = !!wishlistItem;
        }

        // Get related products
        const relatedProducts = await prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: product.id },
                isActive: true,
            },
            take: 5,
            include: {
                images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                },
            },
        });

        return {
            id: product.id,
            sku: product.sku,
            nameAr: product.nameAr,
            nameEn: product.nameEn,
            descriptionAr: product.descriptionAr,
            descriptionEn: product.descriptionEn,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            unit: product.unit,
            stock: product.stock,
            minOrderQty: product.minOrderQty,
            maxOrderQty: product.maxOrderQty,
            weight: product.weight ? Number(product.weight) : null,
            specifications: product.specifications,
            isFeatured: product.isFeatured,
            images: product.images.map((img) => ({
                id: img.id,
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
            })),
            category: product.category,
            brand: product.brand,
            rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
            reviewCount: product._count.reviews,
            reviews: product.reviews.map((r) => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                user: r.user.name || 'Anonymous',
                createdAt: r.createdAt,
            })),
            isInWishlist,
            relatedProducts: relatedProducts.map((p) => ({
                id: p.id,
                nameAr: p.nameAr,
                nameEn: p.nameEn,
                price: Number(p.price),
                originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
                image: p.images[0]?.url || null,
            })),
        };
    }
}

export default new ProductService();
