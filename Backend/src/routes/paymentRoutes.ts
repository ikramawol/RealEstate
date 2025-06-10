import { Router, RequestHandler } from 'express';
import { protect } from '../controllers/authController';
import { createPayment, verifyPaymentStatus } from '../controllers/paymentController';

const router = Router();

// Initialize payment
router.post('/payment/initialize', protect as RequestHandler, createPayment as RequestHandler);

// Verify payment status
router.get('/payment/verify', verifyPaymentStatus as RequestHandler);

export default router; 