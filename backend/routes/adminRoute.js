import express from "express";
import { getSalesAnalytics } from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const adminRouter = express.Router();

adminRouter.get("/analytics", authMiddleware, adminMiddleware, getSalesAnalytics);

export default adminRouter;
