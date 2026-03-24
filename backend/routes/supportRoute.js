import express from 'express';
import { createTicket, getUserTickets, getAllTickets, replyToTicket } from '../controllers/supportController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const supportRouter = express.Router();

// User routes
supportRouter.post('/', authMiddleware, createTicket);
supportRouter.get('/user', authMiddleware, getUserTickets);

// Admin routes (assuming basic auth config from your layout, might need adjustment based on exact admin system)
supportRouter.get('/admin', authMiddleware, adminMiddleware, getAllTickets);
supportRouter.put('/admin/:id/reply', authMiddleware, adminMiddleware, replyToTicket);

export default supportRouter;
