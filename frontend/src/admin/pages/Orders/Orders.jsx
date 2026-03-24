import { useEffect, useState, useContext, useCallback } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { StoreContext } from '../../../Context/StoreContext';
import { 
    Package, User, MapPin, Phone, CreditCard, 
    Truck, Printer, Calendar, ShoppingBag, ChevronRight, 
    CheckCircle2, Clock, AlertCircle, AlertTriangle, XCircle 
} from 'lucide-react';

const Order = () => {
    const { token, url, currency } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");

    const fetchAllOrders = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/order/list`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (response.data.success) {
                setOrders(response.data.data.reverse());
            } else {
                toast.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading orders");
        } finally {
            setLoading(false);
        }
    }, [token, url]);

    const statusHandler = async (event, orderId) => {
        const response = await axios.post(`${url}/api/order/status`, {
            orderId,
            status: event.target.value
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        if (response.data.success) {
            toast.success("Order status updated");
            await fetchAllOrders();
        }
    };

    const printLabel = async (shipmentId) => {
        try {
            const response = await axios.get(`${url}/api/shipping/label/${shipmentId}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (response.data.success) {
                window.open(response.data.labelUrl, '_blank');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error generating label");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle2 className="status-icon green" />;
            case 'Out for delivery': return <Truck className="status-icon blue" />;
            case 'Cancelled': return <XCircle className="status-icon red" />;
            default: return <Clock className="status-icon yellow" />;
        }
    };

    const filteredOrders = filterStatus === "All" 
        ? orders 
        : orders.filter(order => {
            if (filterStatus === "Pending") return order.status === "Order Processing";
            if (filterStatus === "Shipped") return order.status === "Out for delivery";
            if (filterStatus === "Delivered") return order.status === "Delivered";
            if (filterStatus === "Cancelled") return order.status === "Cancelled";
            return true;
        });

    const getPaymentBadge = (order) => {
        if (order.paymentStatus === 'Success') {
            return <span className='badge success'><CheckCircle2 size={12} /> Settled</span>;
        } else if (order.paymentStatus === 'Failed') {
            return <span className='badge failed'><AlertTriangle size={12} /> Failed</span>;
        } else {
            return <span className='badge pending'><Clock size={12} /> Pending</span>;
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, [fetchAllOrders]);

    if (loading) {
        return <div className="admin-loading">Curating your orders...</div>;
    }

    return (
        <div className='admin-orders-page'>
            <div className='admin-orders-header'>
                <div className="header-main">
                    <h1>Order Management</h1>
                    <p>Track and fulfill luxury masterpieces for your global clientele.</p>
                </div>
                <div className="order-filters">
                    {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map(status => (
                        <button 
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="orders-container">
                {filteredOrders.length === 0 ? (
                    <div className="no-orders-msg">No orders found matching your criteria.</div>
                ) : (
                    filteredOrders.map((order, index) => (
                        <div key={index} className={`order-card-luxury ${order.status === 'Cancelled' ? 'cancelled-card' : ''}`}>
                            
                            {/* Card Header: Order ID & Date */}
                            <div className='card-header'>
                                <div className='order-id-block'>
                                    <Package className='pkg-icon' />
                                    <div>
                                        <span>Order Identification</span>
                                        <h4>#{order._id.slice(-8).toUpperCase()}</h4>
                                    </div>
                                </div>
                                <div className='order-date'>
                                    <Calendar size={16} />
                                    <span>{new Date(order.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <div className='card-content-grid'>
                                
                                {/* Items & Customer Detail */}
                                <div className='content-section'>
                                    <div className='sub-section'>
                                        <div className='section-label'><ShoppingBag size={14} /> Masterpieces</div>
                                        <div className='items-list'>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className='item-row'>
                                                    <span className='item-name'>{item.name}</span>
                                                    <span className='item-qty'>qty {item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='sub-section'>
                                        <div className='section-label'><User size={14} /> Consignee</div>
                                        <p className='client-name'>{order.address.firstName} {order.address.lastName}</p>
                                        <div className='client-address'>
                                            <MapPin size={12} />
                                            <p>{order.address.street}, {order.address.city}, {order.address.zipcode}</p>
                                        </div>
                                        <div className='client-phone'>
                                            <Phone size={12} />
                                            <p>{order.address.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Detail */}
                                <div className='content-section financial-bg'>
                                    <div className='sub-section'>
                                        <div className='section-label'><CreditCard size={14} /> Financials</div>
                                        <div className='financial-row'>
                                            <span>Valuation</span>
                                            <h3 className='order-total'>{currency}{order.amount.toLocaleString()}</h3>
                                            {order.discount > 0 && <p className="discount-note" style={{fontSize: '11px', color: '#dc2626', fontWeight: '600'}}>Includes {currency}{order.discount} Discount</p>}
                                        </div>
                                        <div className='payment-badge-status'>
                                            {getPaymentBadge(order)}
                                        </div>
                                        <div className='gateway-info'>
                                            <p>{order.paymentMethod} {order.paymentGateway ? `• ${order.paymentGateway}` : ''}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics Detail */}
                                <div className='content-section logistics-border'>
                                    <div className='sub-section'>
                                        <div className='section-label'><Truck size={14} /> Cargo Tracking</div>
                                        {order.shipmentId ? (
                                            <div className='shipping-active'>
                                                <div className='tracking-row'>
                                                    <span>Ref:</span>
                                                    <code>{order.trackingId || order.shipmentId}</code>
                                                </div>
                                                <p className='courier-name'>{order.courierName || "Assigning Carrier..."}</p>
                                                <div className='shipping-status-indicator'>
                                                    <div className='dot'></div>
                                                    <span>{order.shippingStatus}</span>
                                                </div>
                                                <div className='shipping-actions'>
                                                    <button onClick={() => printLabel(order.shipmentId)} className='action-btn-outline'>
                                                        <Printer size={14} />
                                                        Invoice
                                                    </button>
                                                    {order.trackingId && (
                                                        <a 
                                                            href={`https://shiprocket.co/tracking/${order.trackingId}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className='action-btn-outline track-link'
                                                        >
                                                            <ChevronRight size={14} />
                                                            Track
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='shipping-none'>
                                                <AlertCircle size={18} />
                                                <p>Logistics Pending Selection</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Operations */}
                                <div className='content-section operations-bg'>
                                    <div className='sub-section'>
                                        <div className='section-label'>Workflow Stage</div>
                                        <div className='status-selector-wrapper'>
                                            {getStatusIcon(order.status)}
                                            <select 
                                                onChange={(e) => statusHandler(e, order._id)} 
                                                value={order.status}
                                                className='luxury-select'
                                                disabled={order.status === 'Cancelled'}
                                            >
                                                <option value="Order Processing">At Atelier</option>
                                                <option value="Out for delivery">In Dispatch</option>
                                                <option value="Delivered">Finalized</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                    {order.status === 'Cancelled' && (
                                        <div className='sub-section cancellation-details'>
                                            <div className='section-label' style={{color: '#dc2626'}}>Cancellation Info</div>
                                            <p className='cancel-reason'>"{order.cancellationReason || "No reason provided"}"</p>
                                            <p className='cancel-date'>{order.cancelledAt && new Date(order.cancelledAt).toLocaleString()}</p>
                                            {order.refundStatus === 'Pending' && <span className='refund-badge pending'>Refund Required</span>}
                                            {order.refundStatus === 'Processed' && <span className='refund-badge processed'>Refunded</span>}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Order;
