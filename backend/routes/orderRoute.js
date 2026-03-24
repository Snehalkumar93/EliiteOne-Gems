import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder, placeOrderCod, cancelOrder } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.get("/list", authMiddleware, adminMiddleware, listOrders);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/status", authMiddleware, adminMiddleware, updateStatus);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/placecod", authMiddleware, placeOrderCod);

orderRouter.post("/cancel", authMiddleware, cancelOrder);

export default orderRouter;