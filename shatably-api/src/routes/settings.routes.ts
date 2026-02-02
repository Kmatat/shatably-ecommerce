import { Router } from 'express';
import { getGeneralSettings, getDeliverySettings, getPaymentSettings } from '../utils/settings';

const router = Router();

/**
 * GET /api/settings
 * Public endpoint to get store settings for the website
 */
router.get('/', async (req, res, next) => {
  try {
    const [general, delivery, payment] = await Promise.all([
      getGeneralSettings(),
      getDeliverySettings(),
      getPaymentSettings(),
    ]);

    res.json({
      success: true,
      data: {
        store: {
          nameAr: general.storeNameAr,
          nameEn: general.storeNameEn,
          phone: general.phone,
          email: general.email,
          currency: general.currency,
          defaultLanguage: general.defaultLanguage,
        },
        delivery: {
          expressEnabled: true,
          expressBaseFee: delivery.expressBaseFee,
          scheduledBaseFee: delivery.scheduledBaseFee,
          freeDeliveryThreshold: delivery.freeDeliveryThreshold,
        },
        payment: {
          codEnabled: payment.enableCod,
          cardEnabled: payment.enableCard,
          fawryEnabled: payment.enableFawry,
          walletEnabled: payment.enableWallet,
          minOrderAmount: payment.minOrderAmount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
