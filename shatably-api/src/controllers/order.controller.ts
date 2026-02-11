import { Request, Response, NextFunction } from 'express';
import orderService from '../services/order.service';
import { createPaginatedResponse } from '../utils/helpers';

export class OrderController {

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await orderService.findAll(req.user!.id, req.query);

            res.json({
                success: true,
                ...createPaginatedResponse(result.orders, result.total, Number(result.page), Number(result.limit)),
            });
        } catch (error) {
            next(error);
        }
    };

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await orderService.findById(req.user!.id, id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    createOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await orderService.createOrder(req.user!.id, req.body);

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            await orderService.cancelOrder(req.user!.id, id, reason);

            res.json({
                success: true,
                message: 'Order cancelled successfully',
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new OrderController();
