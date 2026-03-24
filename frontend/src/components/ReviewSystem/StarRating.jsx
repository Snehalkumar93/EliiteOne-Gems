import { useState } from 'react';
import './ReviewSection.css';

const StarRating = ({ rating, setRating, editable = false }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating">
            {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;

                return (
                    <label key={index}>
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => editable && setRating(ratingValue)}
                            style={{ display: 'none' }}
                        />
                        <span
                            className={`star ${ratingValue <= (hover || rating) ? 'filled' : ''} ${editable ? 'editable' : ''}`}
                            onMouseEnter={() => editable && setHover(ratingValue)}
                            onMouseLeave={() => editable && setHover(0)}
                        >
                            ★
                        </span>
                    </label>
                );
            })}
            {!editable && rating > 0 && <span className="rating-number">({rating})</span>}
        </div>
    );
};

export default StarRating;
