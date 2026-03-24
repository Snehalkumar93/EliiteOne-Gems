import { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Smartphone, Landmark, Wallet, CreditCard, ArrowRight, Lock, Banknote } from 'lucide-react';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

// Helper to dynamically load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const PlaceOrder = () => {

    const [payment, setPayment] = useState("cod")
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    })

    const { getTotalCartAmount, token, jewellery_list, cartItems, url, setCartItems,currency,deliveryCharge, discount, appliedCoupon } = useContext(StoreContext);

    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const onPhoneChange = (value) => {
        setData(prev => ({ ...prev, phone: value }));
    }

    const placeOrder = async (e) => {
        e.preventDefault()

        // Phone validation (basic check since react-phone-input-2 doesn't block submission)
        if (data.phone.length < 10) {
            toast.error("Please enter a valid phone number.");
            return;
        }

        let orderItems = [];
        jewellery_list.map(((item) => {
            if (cartItems[item._id] > 0) {
                let itemInfo = { ...item };
                itemInfo["quantity"] = cartItems[item._id];
                orderItems.push(itemInfo)
            }
        }))

        // Determine gateway and method
        let paymentGateway = "None";
        let paymentMethod = payment.toUpperCase();

        if (payment === "stripe") {
            paymentGateway = "Stripe";
            paymentMethod = "CARD";
        } else if (payment === "razorpay") {
            paymentGateway = "Razorpay";
            paymentMethod = "ONLINE"; // This will be narrowed down by Razorpay modal
        }

        let orderData = {
            address: data,
            items: orderItems,
            amount: getTotalCartAmount() + deliveryCharge - discount,
            discount: discount,
            appliedCoupon: appliedCoupon,
            paymentMethod,
            paymentGateway,
            userId: token ? JSON.parse(atob(token.split('.')[1])).id : null // Extract userId from JWT if possible
        }

        try {
            if (payment === "stripe") {
                let response = await axios.post(url + "/api/payment/create-order", orderData, { headers: { token } });
                if (response.data.success) {
                    const { session_url } = response.data;
                    window.location.replace(session_url);
                } else {
                    toast.error(response.data.message || "Something Went Wrong");
                }
            } else if (payment === "razorpay") {
                const res = await loadRazorpayScript();
                if (!res) {
                    toast.error("Razorpay SDK failed to load. Are you online?");
                    return;
                }

                const response = await axios.post(url + "/api/payment/create-order", orderData, { headers: { token } });
                
                if (!response.data.success) {
                    toast.error(response.data.message || "Server error.");
                    return;
                }

                const { amount, id: order_id, currency } = response.data.order;
                const dbOrderId = response.data.dbOrderId;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
                    amount: amount.toString(),
                    currency: currency,
                    name: "EliteOne Gems",
                    description: "Premium jewellery Purchase",
                    image: assets.logo, 
                    order_id: order_id,
                    handler: async function (response) {
                        const verifyData = {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            dbOrderId: dbOrderId,
                            userId: orderData.userId 
                        };

                        const result = await axios.post(url + "/api/payment/verify-razorpay", verifyData, { headers: { token } });

                        if (result.data.success) {
                            toast.success("Payment Successful!");
                            setCartItems({});
                            navigate("/payment-success?orderId=" + dbOrderId + "&transactionId=" + response.razorpay_payment_id);
                        } else {
                            navigate("/payment-failure?orderId=" + dbOrderId);
                        }
                    },
                    modal: {
                        ondismiss: function() {
                            navigate("/payment-failure?orderId=" + dbOrderId + "&cancelled=true");
                        }
                    },
                    prefill: {
                        name: `${orderData.address.firstName} ${orderData.address.lastName}`,
                        email: orderData.address.email,
                        contact: orderData.address.phone,
                    },
                    theme: {
                        color: "#000000",
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.on('payment.failed', function (){
                    navigate("/payment-failure?orderId=" + dbOrderId);
                });
                paymentObject.open();

            } else {
                // COD
                let response = await axios.post(url + "/api/payment/create-order", orderData, { headers: { token } });
                if (response.data.success) {
                    setCartItems({});
                    navigate("/payment-success?method=COD");
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message || "Something Went Wrong");
                }
            }
        } catch (error) {
            console.error("Order process error:", error);
            toast.error("Failed to process order. Please try again.");
        }
    }

    useEffect(() => {
        if (!token) {
            toast.error("to place an order sign in first")
            navigate('/cart')
        }
        else if (getTotalCartAmount() === 0) {
            navigate('/cart')
        }
    }, [token, navigate, getTotalCartAmount])

    return (
        <form onSubmit={placeOrder} className='place-order'>
        <div className="place-order-wrapper">
            <h1 className="checkout-title">Secure Checkout</h1>
            <div className="place-order-content">
                <div className="place-order-left">
                    <p className='section-title'>Delivery Information</p>
                    <div className="multi-field">
                        <div className="input-group">
                            <label>First Name</label>
                            <input type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='John' required />
                        </div>
                        <div className="input-group">
                            <label>Last Name</label>
                            <input type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Doe' required />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='john@example.com' required />
                    </div>
                    <div className="input-group">
                        <label>Street Address</label>
                        <input type="text" name='street' onChange={onChangeHandler} value={data.street} placeholder='123 Luxury Ave' required />
                    </div>
                    <div className="multi-field">
                        <div className="input-group">
                            <label>City</label>
                            <input type="text" name='city' onChange={onChangeHandler} value={data.city} placeholder='Mumbai' required />
                        </div>
                        <div className="input-group">
                            <label>State</label>
                            <input type="text" name='state' onChange={onChangeHandler} value={data.state} placeholder='Maharashtra' required />
                        </div>
                    </div>
                    <div className="multi-field">
                        <div className="input-group">
                            <label>Zip Code</label>
                            <input type="text" name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='400001' required />
                        </div>
                        <div className="input-group">
                            <label>Country</label>
                            <input type="text" name='country' onChange={onChangeHandler} value={data.country} placeholder='India' required />
                        </div>
                    </div>
                    <div className="input-group phone-group">
                        <label>Phone Number</label>
                        <PhoneInput
                            country={'in'}
                            value={data.phone}
                            onChange={onPhoneChange}
                            inputProps={{
                                name: 'phone',
                                required: true,
                            }}
                            containerClass="luxury-phone-input"
                            inputClass="luxury-phone-field"
                            buttonClass="luxury-country-btn"
                            dropdownClass="luxury-country-dropdown"
                            placeholder="+91 9876543210"
                        />
                    </div>
                </div>

                <div className="place-order-right">
                    <div className="order-summary-card">
                        <h2>Order Summary</h2>
                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{currency}{getTotalCartAmount()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{currency}{deliveryCharge}</span>
                            </div>
                            {discount > 0 && (
                                <div className="summary-row discount">
                                    <span>Discount ({appliedCoupon})</span>
                                    <span>-{currency}{discount}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <b>Total</b>
                                <b>{currency}{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryCharge - discount}</b>
                            </div>
                        </div>
                    </div>

                    <div className="payment-method-card">
                        <h2>Select Payment Method</h2>
                        <div className="payment-options">
                            <div onClick={() => setPayment("razorpay")} className={`payment-card ${payment === "razorpay" ? 'active' : ''}`}>
                                <div className="card-selector">
                                    <div className={`radio ${payment === "razorpay" ? 'selected' : ''}`}></div>
                                </div>
                                <div className="card-info">
                                    <p className="card-title">Online Payment (Razorpay)</p>
                                    <p className="card-desc">UPI, Net Banking, Wallets, EMI, Pay Later</p>
                                </div>
                                <div className="card-icons">
                                    <Smartphone size={20} />
                                    <Landmark size={20} />
                                    <Wallet size={20} />
                                </div>
                            </div>

                            <div onClick={() => setPayment("stripe")} className={`payment-card ${payment === "stripe" ? 'active' : ''}`}>
                                <div className="card-selector">
                                    <div className={`radio ${payment === "stripe" ? 'selected' : ''}`}></div>
                                </div>
                                <div className="card-info">
                                    <p className="card-title">Debit / Credit Card (Stripe)</p>
                                    <p className="card-desc">International Cards, Apple Pay, Google Pay</p>
                                </div>
                                <div className="card-icons">
                                    <span className="card-badge">VISA</span>
                                    <span className="card-badge">MC</span>
                                    <span className="card-badge">AMEX</span>
                                    <CreditCard size={20} />
                                </div>
                            </div>

                            <div onClick={() => setPayment("cod")} className={`payment-card ${payment === "cod" ? 'active' : ''}`}>
                                <div className="card-selector">
                                    <div className={`radio ${payment === "cod" ? 'selected' : ''}`}></div>
                                </div>
                                <div className="card-info">
                                    <p className="card-title">Cash on Delivery</p>
                                    <p className="card-desc">Pay with cash when your luxury items arrive</p>
                                </div>
                                <div className="card-icons">
                                    <Banknote size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className='place-order-submit' type='submit'>
                        {payment === "cod" ? "Confirm Order" : "Continue to Payment"}
                        <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                    
                    <div className="trust-footer">
                        <div className="trust-item">
                            <Lock size={16} />
                            <span>256-bit SSL encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </form>
    )
}

export default PlaceOrder
