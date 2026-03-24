// ReviewList component
import StarRating from './StarRating';

const ReviewList = ({ reviews }) => {
    if (reviews.length === 0) {
        return <div className="no-reviews">No reviews yet. Be the first to review!</div>;
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="review-list">
            {reviews.map((review, index) => (
                <div className="review-card" key={review._id} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="review-card-header">
                        <div className="user-info">
                            <div className="user-avatar">{review.userName.charAt(0).toUpperCase()}</div>
                            <div className="user-details">
                                <h5>{review.userName}</h5>
                                <span className="review-date">{formatDate(review.createdAt)}</span>
                            </div>
                        </div>
                        <StarRating rating={review.rating} />
                    </div>
                    <p className="review-comment">{review.comment}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
