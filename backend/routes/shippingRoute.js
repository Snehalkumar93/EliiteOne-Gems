import express from 'express';
import { getTracking, getLabel } from '../controllers/shippingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const shippingRouter = express.Router();

shippingRouter.get('/track/:shipmentId', authMiddleware, getTracking);
shippingRouter.get('/label/:shipmentId', authMiddleware, adminMiddleware, getLabel);

export default shippingRouter;
