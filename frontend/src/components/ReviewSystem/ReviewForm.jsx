import { useState, useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import StarRating from './StarRating';
import { toast } from 'react-toastify';

const ReviewForm = ({ productId, onReviewAdded }) => {
    const { url, token } = useContext(StoreContext);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please enter a comment.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(`${url}/api/review/add`, {
                productId,
                rating,
                comment
            }, { headers: { token } });

            if (response.data.success) {
                toast.success(response.data.message);
                setRating(0);
                setComment("");
                onReviewAdded();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error submitting review.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="login-msg">
                Please <span onClick={() => window.scrollTo(0,0)}>login</span> to write a review.
            </div>
        );
    }

    return (
        <div className="review-form-container">
            <h4>Write a Review</h4>
            <form className="review-form" onSubmit={handleSubmit}>
                <div className="rating-input">
                    <p>Your Rating:</p>
                    <StarRating rating={rating} setRating={setRating} editable={true} />
                </div>
                <textarea 
                    placeholder="Share your experience with this jewellery..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
                <button type="submit" className="submit-review-btn" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Review"}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
