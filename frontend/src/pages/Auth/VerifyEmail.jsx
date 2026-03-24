import { useState, useContext, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import './Auth.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const { url } = useContext(StoreContext);
    const [status, setStatus] = useState('verifying');
    const navigate = useNavigate();

    const verifyEmail = useCallback(async () => {
        try {
            const response = await axios.post(`${url}/api/user/verify-email`, { token });
            if (response.data.success) {
                setStatus('success');
                toast.success(response.data.message);
            } else {
                setStatus('error');
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            setStatus('error');
            toast.error("An error occurred during verification.");
        }
    }, [token, url]);

    useEffect(() => {
        verifyEmail();
    }, [verifyEmail]);

    return (
        <div className='auth-page'>
            <div className="auth-container">
                {status === 'verifying' && (
                    <div className="auth-content">
                        <h2>Verifying your email...</h2>
                        <div className="loader"></div>
                    </div>
                )}
                {status === 'success' && (
                    <div className="auth-content">
                        <h2 className="success-text">Email Verified Successfully!</h2>
                        <p>Your account is now active. You can close this page and log in.</p>
                        <button className='auth-btn' onClick={() => navigate('/')}>Go to Home</button>
                    </div>
                )}
                {status === 'error' && (
                    <div className="auth-content">
                        <h2 className="error-text">Verification Failed</h2>
                        <p>The verification link may be invalid or expired.</p>
                        <button className='auth-btn' onClick={() => navigate('/')}>Go to Home</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
