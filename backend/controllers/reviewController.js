import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";
import jewelleryModel from "../models/jewelleryModel.js";

// Add a new review
const addReview = async (req, res) => {
    const { productId, rating, comment } = req.body;
    const userId = req.body.userId; // From authMiddleware

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check if product exists
        const product = await jewelleryModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        // Check for existing review
        const existingReview = await reviewModel.findOne({ userId, productId });
        if (existingReview) {
            return res.json({ success: false, message: "You already submitted a review." });
        }

        const newReview = new reviewModel({
            userId,
            userName: user.name,
            productId,
            rating,
            comment
        });

        await newReview.save();
        res.json({ success: true, message: "Review added successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding review" });
    }
}

// Get all reviews for a product
const getProductReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const reviews = await reviewModel.find({ productId }).sort({ createdAt: -1 });
        
        // Calculate average rating
        let totalRating = 0;
        reviews.forEach(review => {
            totalRating += review.rating;
        });
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        res.json({ 
            success: true, 
            data: reviews, 
            averageRating: parseFloat(averageRating),
            totalReviews: reviews.length
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
}

// Delete a review (Admin only)
const deleteReview = async (req, res) => {
    const { id } = req.params;

    try {
        await reviewModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting review" });
    }
}

// List all reviews (Admin only)
const listAllReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching all reviews" });
    }
}

export { addReview, getProductReviews, deleteReview, listAllReviews };
