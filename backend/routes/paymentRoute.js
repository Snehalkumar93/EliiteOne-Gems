import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createOrder, verifyRazorpay, verifyStripe, retryRazorpay } from '../controllers/paymentController.js';

const paymentRouter = express.Router();

paymentRouter.post("/create-order", authMiddleware, createOrder);
paymentRouter.post("/verify-razorpay", authMiddleware, verifyRazorpay);
paymentRouter.post("/verify-stripe", authMiddleware, verifyStripe);
paymentRouter.post("/retry-razorpay", authMiddleware, retryRazorpay);

export default paymentRouter;
