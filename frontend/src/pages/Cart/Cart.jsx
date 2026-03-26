import { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {

  const {cartItems, jewellery_list, removeFromCart, updateCartQuantity, getTotalCartAmount, url, currency, deliveryCharge, applyCoupon, discount, appliedCoupon, removeCoupon} = useContext(StoreContext);
  const [promoCode, setPromoCode] = useState("");
  const navigate = useNavigate();

  const handleApplyCoupon = async () => {
    if (!promoCode) return;
    const result = await applyCoupon(promoCode);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message || "Invalid promo code");
    }
    setPromoCode("");
  }

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p> <p>Title</p> <p>Price</p> <p>Quantity</p> <p>Total</p> <p>Remove</p>
        </div>
        <br />
        <hr />
        {jewellery_list.map((item, index) => {
          if (cartItems[item._id]>0) {
            return (<div key={index}>
              <div className="cart-items-title cart-items-item">
                <img src={item.image?.startsWith('http') || item.image?.startsWith('data:') ? item.image : url+"/images/"+item.image} alt="" />
                <p>{item.name}</p>
                <p>{currency}{item.price}</p>
                <div className='cart-item-quantity-control'>
                  <button 
                    onClick={() => updateCartQuantity(item._id, cartItems[item._id] - 1)}
                    disabled={cartItems[item._id] <= 1}
                  >-</button>
                  <span>{cartItems[item._id]}</span>
                  <button onClick={() => updateCartQuantity(item._id, cartItems[item._id] + 1)}>+</button>
                </div>
                <p>{currency}{item.price*cartItems[item._id]}</p>
                <p className='cart-items-remove-icon' onClick={()=>removeFromCart(item._id)}>x</p>
              </div>
              <hr />
            </div>)
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details"><p>Subtotal</p><p>{currency}{getTotalCartAmount()}</p></div>
            <hr />
            <div className="cart-total-details"><p>Delivery Fee</p><p>{currency}{getTotalCartAmount()===0?0:deliveryCharge}</p></div>
            <hr />
            {discount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Discount ({appliedCoupon})</p>
                  <p className="discount-value">-{currency}{discount}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details"><b>Total</b><b>{currency}{getTotalCartAmount()===0?0:getTotalCartAmount()+deliveryCharge-discount}</b></div>
          </div>
          <button onClick={()=>navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className='cart-promocode-input'>
              <input 
                type="text" 
                placeholder='promo code' 
                value={promoCode} 
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={appliedCoupon}
              />
              {appliedCoupon ? (
                <button onClick={removeCoupon} className="remove-promo">Remove</button>
              ) : (
                <button onClick={handleApplyCoupon}>Submit</button>
              )}
            </div>
            {appliedCoupon && <p className="promo-applied-text">Code <b>{appliedCoupon}</b> applied!</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
