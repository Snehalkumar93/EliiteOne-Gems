import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transactionId');
    const method = searchParams.get('method');

    return (
        <div className="payment-success-container">
            <div className="success-card">
                <div className="success-icon">
                    <CheckCircle2 size={72} strokeWidth={1.5} />
                </div>
                <h1>Payment Successful!</h1>
                <p className="success-msg">Thank you for your purchase. Your luxury jewellery is being prepared for shipment.</p>
                
                <div className="order-details">
                    {orderId && (
                        <div className="detail-row">
                            <span>Order ID:</span>
                            <b>#{orderId}</b>
                        </div>
                    )}
                    {transactionId && (
                        <div className="detail-row">
                            <span>Transaction ID:</span>
                            <b>{transactionId}</b>
                        </div>
                    )}
                    <div className="detail-row">
                        <span>Payment Method:</span>
                        <b>{method || (transactionId ? "Online Payment" : "Stripe / Card")}</b>
                    </div>
                    <div className="detail-row">
                        <span>Delivery Estimate:</span>
                        <b>3-5 Business Days</b>
                    </div>
                </div>

                <div className="success-actions">
                    <button onClick={() => navigate('/myorders')} className="view-orders-btn">
                        View My Orders
                    </button>
                    <button onClick={() => navigate('/')} className="continue-shopping-btn">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
