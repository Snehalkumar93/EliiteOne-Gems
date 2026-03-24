import { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import './Auth.css';

const ResetPassword = () => {
    const { token } = useParams();
    const { url } = useContext(StoreContext);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        try {
            const response = await axios.post(`${url}/api/user/reset-password`, { token, password });
            if (response.data.success) {
                toast.success(response.data.message);
                navigate('/');
                // Option: Trigger login popup here if possible
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
                    <div className="auth-success-icon" style={{background: '#f5f3ff', color: '#9333ea'}}>
                        <Lock size={30} />
                    </div>
                    <h2>Secure New Password</h2>
                    <p>Please enter and confirm your new password to restore full access to your collections.</p>
                    <form onSubmit={onSubmitHandler}>
                        <div className="auth-input-group">
                            <input 
                                type="password" 
                                placeholder='Enter new password' 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                minLength={8}
                            />
                        </div>
                        <div className="auth-input-group">
                            <input 
                                type="password" 
                                placeholder='Confirm new password' 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                minLength={8}
                            />
                        </div>
                        <button type='submit' className='auth-btn' disabled={loading}>
                            {loading ? 'Securing...' : 'Update & Continue'}
                            {!loading && <ArrowRight size={18} style={{marginLeft: '10px', verticalAlign: 'middle'}} />}
                        </button>
                    </form>
                    <div className="security-badge-mini" style={{marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9ca3af', fontSize: '12px'}}>
                        <ShieldCheck size={14} />
                        End-to-End Secure Reset
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
