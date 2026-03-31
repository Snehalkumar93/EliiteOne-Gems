import express from 'express';
import { loginUser, registerUser, getUserProfile, updateUserProfile, uploadProfileImage, forgotPassword, resetPassword, trackView } from '../controllers/userController.js';
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import multer from 'multer';

const userRouter = express.Router();

// Profile Image Storage Engine
const storage = multer.memoryStorage();

const upload = multer({ storage: storage })

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", authMiddleware, getUserProfile);
userRouter.put("/profile", authMiddleware, updateUserProfile);
userRouter.put("/upload-image", authMiddleware, upload.single("image"), uploadProfileImage);
userRouter.post("/track-view", authMiddleware, trackView);

// Auth Security Routes
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
// userRouter.get("/verify-email/:token", verifyEmail);
// userRouter.post("/resend-verification", resendVerification);

export default userRouter;