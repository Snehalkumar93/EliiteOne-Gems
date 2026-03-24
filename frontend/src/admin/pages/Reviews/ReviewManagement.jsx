import { useState, useEffect, useContext, useCallback } from 'react';
import './ReviewManagement.css';
import axios from 'axios';
import { StoreContext } from '../../../Context/StoreContext';
import { toast } from 'react-toastify';
import { Star, Trash2, Filter, User, Gem, RefreshCw, ShieldCheck, MessageSquare, ChevronRight } from 'lucide-react';

const ReviewManagement = () => {
    const { token, url } = useContext(StoreContext);
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchAllReviews = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/review/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setReviews(response.data.data);
                setFilteredReviews(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to sync client feedback");
        } finally {
            setLoading(false);
        }
    }, [token, url]);

    const deleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to remove this client feedback from public view?")) return;
        
        try {
            const response = await axios.delete(`${url}/api/review/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success("Feedback successfully curated and removed");
                fetchAllReviews();
            }
        } catch (error) {
            toast.error("Process failed");
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < rating ? "star-gold" : "star-dim"} fill={i < rating ? "currentColor" : "none"} />
        ));
    };

    const handleFilter = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = reviews.filter(rev => 
            rev.userName.toLowerCase().includes(term) || 
            rev.title.toLowerCase().includes(term) || 
            rev.comment.toLowerCase().includes(term)
        );
        setFilteredReviews(filtered);
    };

    useEffect(() => {
        fetchAllReviews();
    }, [fetchAllReviews]);

    if (loading) return <div className="admin-loading">Curating Client Feedback...</div>;

    return (
        <div className='admin-reviews-page'>
            <div className='reviews-header-luxury'>
                <div className='title-area'>
                    <Gem className='gold-icon' size={32} />
                    <div>
                        <h1>Client Feedback</h1>
                        <p>Manage and audit public testimonials for your masterpieces.</p>
                    </div>
                </div>
                <div className='header-tools'>
                    <div className='filter-search-wrapper'>
                        <Filter size={16} className='filter-icon-inline' />
                        <input 
                            type="text" 
                            placeholder="Filter Feed..." 
                            value={searchTerm}
                            onChange={handleFilter}
                            className='feedback-filter-input'
                        />
                    </div>
                    <button onClick={fetchAllReviews} className='tool-btn-gold'>
                        <RefreshCw size={18} />
                        <span>Sync Feedback</span>
                    </button>
                </div>
            </div>

            <div className='reviews-container-grid'>
                {filteredReviews.length === 0 ? (
                    <div className='no-reviews-msg-luxury'>
                        <ShieldCheck size={48} />
                        <p>{searchTerm ? "No results match your filter." : "No client feedback has been recorded yet."}</p>
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <div key={review._id} className='review-card-luxury'>
                            <div className='review-card-top'>
                                <div className='client-identity'>
                                    <div className='client-avatar'>
                                        <User size={20} />
                                    </div>
                                    <div className='client-meta'>
                                        <h4 className='client-name-admin'>{review.userName}</h4>
                                        <div className='review-date-badge'>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className='rating-block-admin'>
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <div className='review-card-content'>
                                <h3 className='review-title-admin'>{review.title}</h3>
                                <div className='comment-box-admin'>
                                    <MessageSquare size={14} className='quote-icon' />
                                    <p>{review.comment}</p>
                                </div>
                            </div>

                            <div className='review-card-footer-admin'>
                                <div className='product-link-admin'>
                                    <span>Target Product ID:</span>
                                    <code>{review.jewelleryId?.slice(-6).toUpperCase() || "N/A"}</code>
                                    <ChevronRight size={14} />
                                </div>
                                <button onClick={() => deleteReview(review._id)} className='trash-btn-admin' title="Censor Review">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewManagement;
