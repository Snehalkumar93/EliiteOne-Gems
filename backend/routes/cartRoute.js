import express from 'express';
import { addToCart, getCart, removeFromCart, updateCartQuantity } from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const cartRouter = express.Router();

cartRouter.post("/get",authMiddleware,getCart);
cartRouter.post("/add",authMiddleware,addToCart);
cartRouter.post("/remove",authMiddleware,removeFromCart);
cartRouter.post("/update",authMiddleware,updateCartQuantity);

export default cartRouter;