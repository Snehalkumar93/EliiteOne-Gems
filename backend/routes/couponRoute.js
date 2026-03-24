import express from 'express';
import { validateCoupon, createCoupon, listCoupons, removeCoupon } from '../controllers/couponController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const couponRouter = express.Router();

couponRouter.post("/validate", validateCoupon);
couponRouter.get("/list", authMiddleware, adminMiddleware, listCoupons);
couponRouter.post("/create", authMiddleware, adminMiddleware, createCoupon);
couponRouter.post("/remove", authMiddleware, adminMiddleware, removeCoupon);

export default couponRouter;
