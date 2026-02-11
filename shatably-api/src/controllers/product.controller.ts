import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import { createPaginatedResponse } from '../utils/helpers';

export class ProductController {

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Logic for query parsing is handled in the request validation schema
            // We pass the parsed query directly to the service
            // Note: In a stricter setup, we might mapreq.query to a specific DTO
            const result = await productService.findAll(req.query);

            res.json({
                success: true,
                ...createPaginatedResponse(result.products, result.total, Number(result.page), Number(result.limit)),
            });
        } catch (error) {
            next(error);
        }
    };

    findFeatured = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await productService.findFeatured();
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    findDeals = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await productService.findDeals();
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    search = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query } = req.params;
            const limit = Math.min(20, parseInt(req.query.limit as string) || 10);

            const result = await productService.search(query, limit);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getBrands = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await productService.getBrands();
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id; // Optional auth

            const result = await productService.findById(id, userId);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new ProductController();
