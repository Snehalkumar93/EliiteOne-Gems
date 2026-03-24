import express from "express";
import { addReview, getProductReviews, deleteReview, listAllReviews } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.get("/list", authMiddleware, adminMiddleware, listAllReviews);
reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.get("/:productId", getProductReviews);
reviewRouter.delete("/:id", authMiddleware, adminMiddleware, deleteReview);

export default reviewRouter;
