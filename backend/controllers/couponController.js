import couponModel from "../models/couponModel.js";

// Validate a coupon code
const validateCoupon = async (req, res) => {
    const { code } = req.body;
    const cartAmount = req.body.cartAmount || req.body.orderAmount;

    try {
        const coupon = await couponModel.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid or inactive promo code" });
        }

        // Check expiration
        if (new Date() > coupon.expirationDate) {
            return res.json({ success: false, message: "Promo code has expired" });
        }

        // Check minimum order amount
        if (cartAmount < coupon.minOrderAmount) {
            return res.json({ success: false, message: `Minimum order of ₹${coupon.minOrderAmount} required for this code` });
        }

        res.json({ 
            success: true, 
            message: "Promo code applied successfully",
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error validating coupon" });
    }
};

// Create a new coupon (for admin use or testing)
const createCoupon = async (req, res) => {
    const { code, discountType, discountValue, expirationDate, minOrderAmount } = req.body;

    try {
        const newCoupon = new couponModel({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            expirationDate: new Date(expirationDate),
            minOrderAmount: minOrderAmount || 0
        });

        await newCoupon.save();
        res.json({ success: true, message: "Coupon created successfully", coupon: newCoupon });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating coupon" });
    }
};

// List all coupons
const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: coupons });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching coupons" });
    }
};

// Remove a coupon
const removeCoupon = async (req, res) => {
    try {
        const { id } = req.body;
        await couponModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Coupon removed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing coupon" });
    }
};

export { validateCoupon, createCoupon, listCoupons, removeCoupon };
