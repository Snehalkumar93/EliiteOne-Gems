import { useContext, useState } from 'react'
import './JewelleryItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext';
import { Link } from 'react-router-dom';

const JewelleryItem = ({ item }) => {
    const { image, name, price, material, _id } = item;
    const [isLiked, setIsLiked] = useState(false);
    const {cartItems,addToCart,removeFromCart,url,currency,role} = useContext(StoreContext);

    return (
        <div className='jewellery-item'>
            <div className='jewellery-item-img-container'>
                <Link to={`/product/${_id}`}><img className='jewellery-item-image' src={image?.startsWith('http') || image?.startsWith('data:') ? image : url+"/images/"+image} alt="" /></Link>
                {role !== 'admin' && (
                    !cartItems[_id]
                    ?<img className='add' onClick={() => addToCart(_id)} src={assets.add_icon_white} alt="" />
                    :<div className="jewellery-item-counter">
                            <img src={assets.remove_icon_red} onClick={()=>removeFromCart(_id)} alt="" />
                            <p>{cartItems[_id]}</p>
                            <img src={assets.add_icon_green} onClick={()=>addToCart(_id)} alt="" />
                        </div>
                )}
            </div>
            <div className="jewellery-item-info">
                <Link to={`/product/${_id}`} className="jewellery-item-name-link">
                    <div className="jewellery-item-name-rating">
                        <p>{name}</p> <img src={assets.rating_starts} alt="" />
                    </div>
                </Link>
                <p className="jewellery-item-desc">{material}</p>
                <div className="jewellery-item-price-wishlist">
                    <p className="jewellery-item-price">{currency}{price}</p>
                    <button 
                        className={`wishlist-btn ${isLiked ? 'liked' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setIsLiked(!isLiked);
                        }}
                    >
                        {isLiked ? '❤' : '♡'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default JewelleryItem
