import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import sendEmail from "../config/email.js";
import generateToken from "../utils/generateToken.js";

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    try {
        const user = await userModel.findOne({ email: normalizedEmail })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        if (user.isVerified === false) {
            return res.json({ success: false, message: "Please verify your email before logging in." });
        }


        const token = generateToken(user._id, user.role);
        res.json({ 
            success: true, 
            token, 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        })
    } catch (error) {
        console.error('Login Error details:', error);
        res.json({ success: false, message: error.message || "Error" })
    }
}

const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    try {
        // checking if user already exists
        const exists = await userModel.findOne({ email: normalizedEmail });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(normalizedEmail)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Generate verification token
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const verifyTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const newUser = new userModel({
            name: name,
            email: normalizedEmail,
            password: hashedPassword,
            isVerified: false, // Must be explicitly false for new users
            verifyToken: verifyToken,
            verifyTokenExpiry: verifyTokenExpiry
        })

        const user = await newUser.save()
        
        // Send Verification Email
        const clientUrl = process.env.CLIENT_URL;
        if (!clientUrl) {
            console.warn("[WARN] CLIENT_URL environment variable is missing. Verification links will default to http://localhost:5173");
        }
        const baseUrl = clientUrl || "http://localhost:5173";
        const verifyLink = `${baseUrl}/verify-email/${verifyToken}`;
        
        console.log(`[VERIFY_EMAIL] Generated link for ${normalizedEmail}: ${verifyLink}`);
        
        const emailSubject = 'Verify Your Email - EliteOne Gems';
        const emailHtml = `
            <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px; color: #1a1a1a;">
                <h2 style="color: #9333ea; text-align: center; font-size: 28px;">Welcome to EliteOne Gems</h2>
                <p style="font-size: 16px; line-height: 1.6;">Thank you for registering! Please click the button below to verify your email address and activate your account. This link is valid for <b>24 hours</b>.</p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${verifyLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 999px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">VERIFY EMAIL</a>
                </div>
                <p style="font-size: 14px; color: #6b7280;">If you did not create an account, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;">
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} EliteOne Gems. All rights reserved.</p>
            </div>
        `;

        const mailSent = await sendEmail(normalizedEmail, emailSubject, emailHtml);
        if (mailSent) {
            console.log(`[VERIFY_EMAIL] Email successfully sent to ${normalizedEmail}`);
        } else {
            console.error(`[VERIFY_EMAIL] Failed to send email to ${normalizedEmail}`);
        }

        res.json({ success: true, message: "Registration successful! Please check your email for verification link." })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

// get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.body.userId;
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// update user profile
const updateUserProfile = async (req, res) => {
    const { name, email, profileImage, password } = req.body;
    try {
        const updateData = {};
        if (name) updateData.name = name;
        if (email) {
            if (!validator.isEmail(email)) {
                return res.json({ success: false, message: "Invalid email" });
            }
            updateData.email = email.toLowerCase().trim();
        }
        if (profileImage) updateData.profileImage = profileImage;
        if (password) {
            if (password.length < 8) {
                return res.json({ success: false, message: "Password too weak" });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const userId = req.user.id || req.body.userId;
        const user = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "Profile updated successfully", data: user });
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.json({ success: false, message: "Email already in use" });
        }
        res.json({ success: false, message: "Error updating profile" });
    }
}

// upload profile image
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "No image provided" });
        }
        
        const profileImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const userId = req.user.id || req.body.userId;
        const user = await userModel.findByIdAndUpdate(userId, { profileImage }, { new: true }).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "Image uploaded successfully", data: user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error uploading image" });
    }
}

// forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    try {
        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            // Safe response to prevent email enumeration
            return res.json({ success: true, message: "If this email is registered, a reset link has been sent." });
        }

        // Generate secure 32-byte token
        const resetToken = crypto.randomBytes(32).toString("hex");
        
        // Save token and expiry (15 minutes)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const emailSubject = 'Secure Password Reset Request - EliteOne Gems';
        const emailHtml = `
            <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px; color: #1a1a1a;">
                <h2 style="color: #9333ea; text-align: center; font-size: 28px;">Restore Your Access</h2>
                <p style="font-size: 16px; line-height: 1.6;">You requested a password reset for your EliteOne Gems account. For your security, this link is valid for <b>15 minutes</b> and can only be used once.</p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${resetLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 999px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">RESET PASSWORD</a>
                </div>
                <p style="font-size: 14px; color: #6b7280;">If you did not request this, please ignore this email or contact support if you have concerns.</p>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;">
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} EliteOne Gems. All rights reserved.</p>
            </div>
        `;

        const mailSent = await sendEmail(normalizedEmail, emailSubject, emailHtml);
        
        if (!mailSent) {
            console.error(`Email delivery failed for: ${normalizedEmail}`);
            // Still return success to user for security, but we know it failed
        }

        res.json({ success: true, message: "If this email is registered, a reset link has been sent." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.json({ success: false, message: "An unexpected error occurred. Please try again later." });
    }
}

// reset password
const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        // Find user with valid token and expiry
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.json({ success: false, message: "The reset link is invalid or has expired." });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long." });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user and clear token fields (One-time use)
        user.password = hashedPassword;
        user.resetPasswordToken = "";
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ success: true, message: "Your password has been updated. You can now login with your new credentials." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.json({ success: false, message: "Failed to reset password. Please try again." });
    }
}

// Track browsing history for recommendations
const trackView = async (req, res) => {
    const { productId } = req.body;
    const userId = req.body.userId;
    try {
        const user = await userModel.findById(userId);
        if (user) {
            // Keep history limited to last 10 products
            let history = user.browsingHistory || [];
            history = history.filter(id => id && id.toString() !== productId);
            history.unshift(productId);
            user.browsingHistory = history.slice(0, 10);
            await user.save();
            res.json({ success: true, message: "View tracked" });
        } else {
            res.json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error tracking view" });
    }
}


// Verify Email
const verifyEmail = async (req, res) => {
    const { token } = req.body;
    try {
        if (!token) {
            return res.json({ success: false, message: "No verification token provided." });
        }

        const user = await userModel.findOne({
            verifyToken: token,
            verifyTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            console.warn(`[VERIFY_EMAIL] Invalid or expired token attempt: ${token?.substring(0, 8)}...`);
            return res.json({ success: false, message: "Invalid or expired verification link." });
        }

        user.isVerified = true;
        user.verifyToken = "";
        user.verifyTokenExpiry = null;
        await user.save();

        console.log(`[VERIFY_EMAIL] User ${user.email} verified successfully.`);

        res.json({ success: true, message: "Email verified successfully! You can now login." });
    } catch (error) {
        console.error("Verify Email Error:", error);
        res.json({ success: false, message: "Verification failed. Please try again." });
    }
}

// Resend Verification Email
const resendVerification = async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    try {
        const user = await userModel.findOne({ email: normalizedEmail });
        
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        if (user.isVerified) {
            return res.json({ success: false, message: "Account is already verified. Please login." });
        }

        // Generate new verification token
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const verifyTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        user.verifyToken = verifyToken;
        user.verifyTokenExpiry = verifyTokenExpiry;
        await user.save();

        // Send Verification Email
        const clientUrl = process.env.CLIENT_URL;
        if (!clientUrl) {
            console.warn("[WARN] CLIENT_URL environment variable is missing. Verification links will default to http://localhost:5173");
        }
        const baseUrl = clientUrl || "http://localhost:5173";
        const verifyLink = `${baseUrl}/verify-email/${verifyToken}`;
        
        console.log(`[VERIFY_EMAIL] Resending link for ${normalizedEmail}: ${verifyLink}`);

        const emailSubject = 'Verify Your Email - EliteOne Gems';
        const emailHtml = `
            <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px; color: #1a1a1a;">
                <h2 style="color: #9333ea; text-align: center; font-size: 28px;">Verify Your Email</h2>
                <p style="font-size: 16px; line-height: 1.6;">You requested a new verification link. Please click the button below to activate your account. This link is valid for <b>24 hours</b>.</p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${verifyLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 999px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">VERIFY EMAIL</a>
                </div>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;">
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} EliteOne Gems. All rights reserved.</p>
            </div>
        `;

        const mailSent = await sendEmail(normalizedEmail, emailSubject, emailHtml);
        if (mailSent) {
            console.log(`[VERIFY_EMAIL] Resend successful for ${normalizedEmail}`);
        } else {
            console.error(`[VERIFY_EMAIL] Resend failed for ${normalizedEmail}`);
        }

        res.json({ success: true, message: "Verification email resent successfully!" });
    } catch (error) {
        console.error("Resend Verification Error:", error);
        res.json({ success: false, message: "Failed to resend verification email." });
    }
}

export { loginUser, registerUser, getUserProfile, updateUserProfile, uploadProfileImage, forgotPassword, resetPassword, trackView, verifyEmail, resendVerification }