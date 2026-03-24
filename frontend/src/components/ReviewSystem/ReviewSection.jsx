import { useState, useEffect, useContext, useCallback } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';
import './ReviewSection.css';

const ReviewSection = ({ productId, onStatsUpdate }) => {
    const { url } = useContext(StoreContext);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/review/${productId}`);
            if (response.data.success) {
                setReviews(response.data.data);
                setAverageRating(response.data.averageRating);
                setTotalReviews(response.data.totalReviews);
                if (onStatsUpdate) {
                    onStatsUpdate(response.data.averageRating, response.data.totalReviews);
                }
            }
        } catch (error) {
            console.error("Error fetching reviews", error);
        } finally {
            setLoading(false);
        }
    }, [url, productId, onStatsUpdate]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return (
        <div className="review-section">
            <div className="review-header">
                <h3>Customer Reviews</h3>
                <div className="review-summary">
                    {totalReviews > 0 && <span className="average-rating">{averageRating}</span>}
                    <div className="summary-stars">
                        <StarRating rating={averageRating} />
                        <p>{totalReviews} Total Reviews</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="no-reviews">Loading reviews...</div>
            ) : (
                <>
                    <ReviewList reviews={reviews} />
                    <ReviewForm productId={productId} onReviewAdded={fetchReviews} />
                </>
            )}
        </div>
    );
};

export default ReviewSection;
