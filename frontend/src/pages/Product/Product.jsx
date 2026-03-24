import { useContext, useEffect, useState, useCallback } from 'react'
import './Product.css'
import { useParams, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { assets } from '../../assets/assets'
import ReviewSection from '../../components/ReviewSystem/ReviewSection'
import Recommendations from '../../components/Recommendations/Recommendations'
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react'

const Product = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { url, addToCart, cartItems, currency, role, token } = useContext(StoreContext)
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [reviewStats, setReviewStats] = useState({ average: 0, total: 0 })
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false })

    const handleBuyNow = () => {
        if (!cartItems[id]) {
            addToCart(id);
        }
        navigate('/order');
    }

    const fetchProduct = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/jewellery/${id}`)
            if (response.data.success) {
                setProduct(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching product", error)
        } finally {
            setLoading(false)
        }
    }, [id, url]);

    useEffect(() => {
        fetchProduct();
        
        // Track browsing history for recommendations
        if (token) {
            const trackView = async () => {
                try {
                    await axios.post(`${url}/api/user/track-view`, { productId: id }, { headers: { token } });
                } catch (error) {
                    console.error("Error tracking view", error);
                }
            }
            trackView();
        }
    }, [fetchProduct, id, token, url]);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.target.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setZoomPos({ x, y, show: true });
    }

    if (loading) {
        return <div className='product-loading'>Loading...</div>
    }

    if (!product) {
        return <div className='product-error'>Product not found.</div>
    }

    const gallery = [product.image, ...(product.images || [])];

    const nextImage = () => {
        setActiveImage((prev) => (prev + 1) % gallery.length);
    }

    const prevImage = () => {
        setActiveImage((prev) => (prev - 1 + gallery.length) % gallery.length);
    }

    return (
        <div className='product-page-wrapper'>
            <div className='product-details-container'>
                <div className='product-details-left'>
                    <div className='product-main-image-container' 
                         onMouseMove={handleMouseMove}
                         onMouseLeave={() => setZoomPos({...zoomPos, show: false})}>
                        {gallery.length > 1 && <button className='slider-btn prev' onClick={prevImage}>&#10094;</button>}
                        <img className='product-main-image' src={url + "/images/" + gallery[activeImage]} alt={product.name} key={activeImage} />
                        {zoomPos.show && (
                            <div className='zoom-overlay' style={{
                                backgroundImage: `url(${url + "/images/" + gallery[activeImage]})`,
                                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                            }}></div>
                        )}
                        {gallery.length > 1 && <button className='slider-btn next' onClick={nextImage}>&#10095;</button>}
                    </div>
                    {gallery.length > 1 && (
                        <div className='product-thumbnails'>
                            {gallery.map((img, index) => (
                                <div 
                                    key={index} 
                                    className={`thumbnail-item ${index === activeImage ? 'active' : ''}`}
                                    onClick={() => setActiveImage(index)}
                                >
                                    <img src={url + "/images/" + img} alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className='product-details-right'>
                    <div className="product-header">
                        <h2>{product.name}</h2>
                        {product.stock === 0 ? (
                            <span className='out-of-stock-badge'>Currently Unavailable</span>
                        ) : (
                            <div className="product-rating">
                                <div className="stars-mini">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`star-mini ${i < Math.round(reviewStats.average) ? 'filled' : ''}`}>★</span>
                                    ))}
                                </div>
                                <p>({reviewStats.total} + reviews)</p>
                            </div>
                        )}
                    </div>
                    <p className='product-price'>{currency}{product.price}</p>
                    
                    <div className="certification-badges">
                        <div className="cert-badge">
                            <img src={assets.verified_icon || assets.tick_icon} alt="" />
                            <span>BIS Hallmarked Gold</span>
                        </div>
                        <div className="cert-badge">
                            <img src={assets.verified_icon || assets.tick_icon} alt="" />
                            <span>Lifetime Authenticity</span>
                        </div>
                    </div>

                    <div className="product-info-grid">
                        <div className="info-item">
                            <span className="info-label">Material:</span>
                            <span className="info-value">{product.material || "Gold"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Category:</span>
                            <span className="info-value">{product.category}</span>
                        </div>
                        {product.weight && (
                            <div className="info-item">
                                <span className="info-label">Weight:</span>
                                <span className="info-value">{product.weight}</span>
                            </div>
                        )}
                    </div>
                    <p className='product-description'>{product.description}</p>
                    
                    {role !== 'admin' && (
                        <div className='product-actions'>
                            <button 
                                className='add-to-cart-btn' 
                                onClick={() => addToCart(id)}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? "Out of Stock" : (!cartItems[id] ? "Add to Cart" : `In Cart (${cartItems[id]})`)}
                            </button>
                            <button 
                                className='buy-now-btn' 
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                            >
                                Buy Now
                            </button>
                        </div>
                    )}

                    <div className="product-meta">
                        <p><b>Stone:</b> {product.stoneType || "None"}</p>
                        <p><b>Occasion:</b> {product.occasion || "Anniversary"}</p>
                    </div>

                    <div className="trust-signals-premium">
                        <div className="trust-item">
                            <Truck size={20} strokeWidth={1.5} />
                            <div className="trust-text">
                                <h5>Free Delivery</h5>
                                <p>On orders above {currency}999</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <RotateCcw size={20} strokeWidth={1.5} />
                            <div className="trust-text">
                                <h5>Easy Returns</h5>
                                <p>10 Days Return Policy</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <ShieldCheck size={20} strokeWidth={1.5} />
                            <div className="trust-text">
                                <h5>Authentic</h5>
                                <p>100% Certified jewellery</p>
                            </div>
                        </div>
                        <div className="trust-item">
                            <Lock size={20} strokeWidth={1.5} />
                            <div className="trust-text">
                                <h5>Secure</h5>
                                <p>Encrypted Payments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <ReviewSection 
                productId={id} 
                onStatsUpdate={(average, total) => setReviewStats({ average, total })} 
            />

            <Recommendations userId={token ? (() => { 
                try { 
                    const payload = token.split('.')[1];
                    if (!payload) return "null";
                    const decoded = JSON.parse(atob(payload));
                    return decoded.id || decoded._id || "null";
                } catch(e) { 
                    console.error("Token decode error", e);
                    return "null"; 
                } 
            })() : "null"} />
        </div>
    )
}

export default Product
