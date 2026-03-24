import { useNavigate, useSearchParams } from 'react-router-dom';
import { Info, XCircle } from 'lucide-react';
import './PaymentFailure.css';

const PaymentFailure = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isCancelled = searchParams.get('cancelled') === 'true';
    const orderId = searchParams.get('orderId');

    return (
        <div className="payment-failure-container">
            <div className="failure-card">
                <div className="failure-icon">
                    {isCancelled ? <Info size={72} strokeWidth={1.5} color='#f59e0b' /> : <XCircle size={72} strokeWidth={1.5} />}
                </div>
                <h1>{isCancelled ? 'Payment Cancelled' : 'Payment Failed'}</h1>
                {orderId && orderId.length >= 8 && <p className="order-ref-failure">Order Reference: <b>#{orderId.slice(-8).toUpperCase()}</b></p>}
                <p className="failure-msg">
                    {isCancelled 
                        ? 'Payment cancelled. Your order was not completed. You can try again whenever you are ready.' 
                        : "We couldn't process your payment. This could be due to incorrect details, insufficient funds, or a temporary gateway issue."
                    }
                </p>
                
                <div className="failure-actions">
                    <button onClick={() => navigate('/order')} className="retry-btn">
                        Try Again
                    </button>
                    <button onClick={() => navigate('/support')} className="contact-support-btn">
                        Contact Support
                    </button>
                    <button onClick={() => navigate('/')} className="home-btn">
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
