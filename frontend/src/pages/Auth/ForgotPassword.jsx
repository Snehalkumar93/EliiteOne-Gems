import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { url } = useContext(StoreContext);
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${url}/api/user/forgot-password`, { email });
            if (response.data.success) {
                setIsSent(true);
                toast.success("Reset link sent successfully");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='auth-page'>
            <div className="auth-container">
                <div className="auth-content">
                    {isSent ? (
                        <div className="animate-fade">
                            <div className="auth-success-icon">
                                <CheckCircle size={32} />
                            </div>
                            <h2>Email Sent</h2>
                            <p>We've sent a luxury reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.</p>
                            <button className='auth-btn' onClick={() => setIsSent(false)}>Resend Link</button>
                            <button className='auth-secondary-btn' onClick={() => navigate('/')}>Return to Store</button>
                        </div>
                    ) : (
                        <form onSubmit={onSubmitHandler}>
                            <h2>Forgot Password?</h2>
                            <p>Enter your registered email and we'll send you an exclusive link to restore access to your account.</p>
                            <div className="auth-input-group">
                                <input 
                                    type="email" 
                                    placeholder='Enter your email address' 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type='submit' className='auth-btn' disabled={loading}>
                                {loading ? 'Requesting...' : 'Request Reset Link'}
                            </button>
                            <button type='button' className='auth-secondary-btn' onClick={() => navigate('/')}>
                                <ArrowLeft size={16} style={{marginRight: '8px', verticalAlign: 'middle'}} />
                                Back to Boutique
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
