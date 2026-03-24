import { useContext, useEffect, useState, useCallback } from 'react'
import './MyOrders.css'
import axios from 'axios'
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { Package, Truck, CheckCircle, Clock, Search, MapPin, PackageCheck, AlertTriangle, RefreshCcw, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

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

const MyOrders = () => {
    const [data, setData] = useState([]);
    const { url, token, currency } = useContext(StoreContext);
    const [loading, setLoading] = useState(false);
    const [trackingData, setTrackingData] = useState(null);
    const [showTracking, setShowTracking] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancellationReason, setCancellationReason] = useState("");
    const [cancelLoading, setCancelLoading] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(true); // Wait, line 40 was setLoading(false), let me fix that to false
            setLoading(false);
        }
    }, [token, url]);

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;
        setCancelLoading(true);
        try {
            const response = await axios.post(`${url}/api/order/cancel`, {
                orderId: selectedOrder._id,
                cancellationReason
            }, { headers: { token } });

            if (response.data.success) {
                // Update local state without reload
                setData(prevData => prevData.map(order => 
                    order._id === selectedOrder._id ? { ...order, status: "Cancelled", cancellationReason, cancelledAt: new Date() } : order
                ));
                setShowCancelModal(false);
                setSelectedOrder(null);
                setCancellationReason("");
            } else {
                alert(response.data.message || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            alert("Error connecting to server");
        } finally {
            setCancelLoading(false);
        }
    }

    const handleTrackOrder = async (shipmentId) => {
        setTrackingLoading(true);
        setShowTracking(true);
        try {
            const response = await axios.get(`${url}/api/shipping/track/${shipmentId}`, { headers: { token } });
            if (response.data.success) {
                setTrackingData(response.data.data);
            } else {
                setTrackingData({ error: response.data.message });
            }
        } catch (error) {
            setTrackingData({ error: "Failed to fetch tracking details" });
        } finally {
            setTrackingLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [fetchOrders, token]);

    const getStatusStep = (status) => {
        switch (status) {
            case 'Order Processing': return 1;
            case 'Shipped': return 2;
            case 'Out for delivery': return 2;
            case 'Delivered': return 3;
            case 'Cancelled': return -1;
            default: return 1;
        }
    };

    const retryPayment = async (order) => {
        try {
            const res = await loadRazorpayScript();
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                return;
            }

            const response = await axios.post(url + "/api/payment/retry-razorpay", { orderId: order._id }, { headers: { token } });
            
            if (!response.data.success) {
                toast.error(response.data.message || "Server error.");
                return;
            }

            const { amount, id: order_id, currency: razorpayCurrency } = response.data.order;
            const dbOrderId = response.data.dbOrderId;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
                amount: amount.toString(),
                currency: razorpayCurrency,
                name: "EliteOne Gems",
                description: "Premium jewellery Purchase (Retry)",
                image: assets.logo, 
                order_id: order_id,
                handler: async function (response) {
                    const verifyData = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        dbOrderId: dbOrderId,
                        userId: order.userId 
                    };

                    const result = await axios.post(url + "/api/payment/verify-razorpay", verifyData, { headers: { token } });

                    if (result.data.success) {
                        toast.success("Payment Successful!");
                        fetchOrders();
                    } else {
                        toast.error("Verification failed.");
                    }
                },
                prefill: {
                    name: `${order.address.firstName} ${order.address.lastName}`,
                    email: order.address.email,
                    contact: order.address.phone,
                },
                theme: {
                    color: "#000000",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Retry payment error:", error);
            toast.error("Failed to initiate payment.");
        }
    };

    const getPaymentBadge = (status) => {
        switch (status) {
            case 'Success': return <span className="payment-badge success"><CheckCircle size={12} /> Paid</span>;
            case 'Failed': return <span className="payment-badge failed"><AlertTriangle size={12} /> Failed</span>;
            default: return <span className="payment-badge pending"><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <div className='my-orders-luxury'>
            <div className="orders-header">
                <div className="header-content">
                    <h1>My Purchase History</h1>
                    <p>Track and manage your exquisite collections.</p>
                </div>
                <div className="header-actions">
                   <button className="refresh-orders" onClick={fetchOrders} disabled={loading}>
                       {loading ? "Updating..." : "Refresh Status"}
                   </button>
                </div>
            </div>

            <div className="orders-container-luxury">
                {data.length === 0 && !loading ? (
                    <div className="empty-orders-state">
                        <Package size={60} strokeWidth={1} />
                        <h3>No Orders Found</h3>
                        <p>It seems you haven't started your collection yet.</p>
                    </div>
                ) : (
                    data.map((order, index) => {
                        return (
                            <div key={index} className='order-card-luxury'>
                                <div className="order-main-info">
                                    <div className="order-id-group">
                                        <div className="parcel-icon-wrapper">
                                            <Package size={24} />
                                        </div>
                                        <div className="id-details">
                                            <span className="order-label">Order Reference</span>
                                            <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="order-meta-info">
                                        <div className="meta-item">
                                            <Clock size={16} />
                                            <span>{new Date(order.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="meta-item">
                                            <MapPin size={16} />
                                            <span>{order.address.city}, {order.address.state}</span>
                                        </div>
                                    </div>
                                    <div className="order-price-group">
                                        <div className="price-info">
                                            <span className="price-label">Total Investment</span>
                                            <span className="price-value">{currency}{order.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="payment-status-info">
                                            {getPaymentBadge(order.paymentStatus || (order.payment ? "Success" : "Pending"))}
                                        </div>
                                    </div>
                                </div>

                                <div className="order-items-preview">
                                    <h4>Included Items ({order.items.length})</h4>
                                    <div className="items-list">
                                        {order.items.map((item, idx) => (
                                            <span key={idx} className="item-badge">
                                                {item.name} <span className="item-qty">×{item.quantity}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                    {order.status === 'Cancelled' ? (
                                        <div className="order-cancelled-notice">
                                            <XCircle size={16} />
                                            <span>Order Cancelled {order.cancelledAt && `on ${new Date(order.cancelledAt).toLocaleDateString()}`}</span>
                                            {order.cancellationReason && <p className="cancel-reason">Reason: {order.cancellationReason}</p>}
                                        </div>
                                    ) : (
                                        <div className="order-tracking-timeline">
                                            <div className="timeline-track">
                                                <div className={`timeline-step ${getStatusStep(order.status) >= 1 ? 'active' : ''}`}>
                                                    <div className="step-circle"><Clock size={16} /></div>
                                                    <span className="step-label">Processing</span>
                                                </div>
                                                <div className={`timeline-line ${getStatusStep(order.status) >= 2 ? 'active' : ''}`}></div>
                                                <div className={`timeline-step ${getStatusStep(order.status) >= 2 ? 'active' : ''}`}>
                                                    <div className="step-circle"><Truck size={16} /></div>
                                                    <span className="step-label">Shipped</span>
                                                </div>
                                                <div className={`timeline-line ${getStatusStep(order.status) >= 3 ? 'active' : ''}`}></div>
                                                <div className={`timeline-step ${getStatusStep(order.status) >= 3 ? 'active' : ''}`}>
                                                    <div className="step-circle"><PackageCheck size={16} /></div>
                                                    <span className="step-label">Delivered</span>
                                                </div>
                                            </div>
                                            <div className="status-meta">
                                                <div className="current-status-badge">
                                                    <span className="pulse-dot"></span>
                                                    Current Status: <strong>{order.status}</strong>
                                                </div>
                                                {order.status === 'Order Processing' && order.cancelAllowedUntil && new Date() < new Date(order.cancelAllowedUntil) && (
                                                    <div className="cancel-timer">
                                                        <Clock size={14} /> 
                                                        <span>Cancel within {Math.ceil((new Date(order.cancelAllowedUntil) - new Date()) / 60000)} mins</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                
                                <div className="order-card-actions">
                                    {order.paymentStatus === 'Failed' && (
                                        <button className="retry-btn-luxury" onClick={() => retryPayment(order)}>
                                            <RefreshCcw size={16} /> Retry Payment
                                        </button>
                                    )}
                                    {order.status === 'Order Processing' && (
                                        <div className="cancel-action-container">
                                            {order.cancelAllowedUntil && new Date() > new Date(order.cancelAllowedUntil) ? (
                                                <span className="window-closed-msg">
                                                    <AlertTriangle size={14} /> Cancellation window closed
                                                </span>
                                            ) : (
                                                <button 
                                                    className="cancel-btn-luxury" 
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowCancelModal(true);
                                                    }}
                                                >
                                                    <XCircle size={16} /> Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {order.shipmentId ? (
                                        <button className="track-btn-luxury" onClick={() => handleTrackOrder(order.shipmentId)}>
                                            <Search size={16} /> Track Shipment
                                        </button>
                                    ) : (
                                        <button className="track-btn-luxury" onClick={fetchOrders}>
                                            <Search size={16} /> Refresh Status
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {showTracking && (
                <div className="tracking-modal-overlay" onClick={() => setShowTracking(false)}>
                    <div className="tracking-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Tracking Details</h3>
                            <button className="close-modal" onClick={() => setShowTracking(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {trackingLoading ? (
                                <div className="loading-tracking">Fetching real-time updates...</div>
                            ) : trackingData?.error ? (
                                <div className="tracking-error">{trackingData.error}</div>
                            ) : trackingData ? (
                                <div className="tracking-timeline-detailed">
                                    <div className="tracking-summary">
                                        <p><strong>Courier:</strong> {trackingData.tracking_data?.track_url ? "View Detailed Track" : "Shiprocket"}</p>
                                        <p><strong>Tracking ID:</strong> {trackingData.tracking_data?.shipment_track?.[0]?.tracking_number || "N/A"}</p>
                                    </div>
                                    <div className="detailed-steps">
                                        {trackingData.tracking_data?.shipment_track_activities?.map((activity, idx) => (
                                            <div key={idx} className="activity-step">
                                                <div className="activity-dot"></div>
                                                <div className="activity-info">
                                                    <p className="activity-status">{activity.status}</p>
                                                    <p className="activity-location">{activity.location}</p>
                                                    <p className="activity-date">{new Date(activity.date).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )) || <p>No detailed activity yet. Shipment is being processed.</p>}
                                    </div>
                                </div>
                            ) : (
                                <p>No tracking data available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCancelModal && (
                <div className="tracking-modal-overlay" onClick={() => setShowCancelModal(false)}>
                    <div className="tracking-modal-content cancel-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Cancel Your Order</h3>
                            <button className="close-modal" onClick={() => setShowCancelModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="cancel-warning">
                                <AlertTriangle color="#dc2626" size={32} />
                                <p>Are you sure you want to cancel order <strong>#{selectedOrder?._id.slice(-8).toUpperCase()}</strong>?</p>
                                <p className="sub-warning">This action cannot be undone.</p>
                            </div>
                            
                            <div className="reason-selection">
                                <label>Reason for cancellation (optional)</label>
                                <select 
                                    value={cancellationReason} 
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    className="reason-select"
                                >
                                    <option value="">Select a reason</option>
                                    <option value="Ordered by mistake">Ordered by mistake</option>
                                    <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                                    <option value="Delayed delivery">Delayed delivery</option>
                                    <option value="Changed my mind">Changed my mind</option>
                                    <option value="Other">Other</option>
                                </select>
                                {cancellationReason === "Other" && (
                                    <textarea 
                                        placeholder="Please specify..." 
                                        className="reason-textarea"
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                    ></textarea>
                                )}
                            </div>

                            <div className="cancel-actions">
                                <button className="keep-btn" onClick={() => setShowCancelModal(false)}>
                                    Keep Order
                                </button>
                                <button 
                                    className="confirm-cancel-btn" 
                                    onClick={handleCancelOrder}
                                    disabled={cancelLoading}
                                >
                                    {cancelLoading ? "Processing..." : "Confirm Cancellation"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyOrders
