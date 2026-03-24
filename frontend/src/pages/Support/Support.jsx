import { useContext, useState } from 'react';
import './Support.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Send, Tag, HelpCircle } from 'lucide-react';

const Support = () => {
    const { url, token } = useContext(StoreContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        category: 'Product Question',
        message: ''
    });

    const [loading, setLoading] = useState(false);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({ ...data, [name]: value }));
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        if (!token) {
            toast.error("Please login to submit a support ticket.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(url + "/api/support", formData, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    category: 'Product Question',
                    message: ''
                });
                navigate('/profile'); // Navigate to profile to see the ticket
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error submitting ticket.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='support-page-wrapper'>
            <div className="support-hero">
                <h1>Concierge Support</h1>
                <p>Ensuring your experience with EliteOne Gems is as flawless as our collection.</p>
            </div>

            <div className="support-content-container">
                <div className="support-contact-info">
                    <div className="info-card">
                        <div className="info-icon"><Mail size={24} /></div>
                        <div>
                            <h4>Email Us</h4>
                            <p>eliteonegems@gmail.com</p>
                            <span>Typical response in 24h</span>
                        </div>
                    </div>
                    <div className="info-card">
                        <div className="info-icon"><HelpCircle size={24} /></div>
                        <div>
                            <h4>Help Center</h4>
                            <p>Browse our FAQ guides</p>
                            <span>Find quick answers</span>
                        </div>
                    </div>
                </div>

                <div className="support-form-card">
                    <div className="card-header">
                        <div className="header-icon"><MessageSquare size={20} /></div>
                        <h2>Send a Message</h2>
                    </div>
                    
                    <form onSubmit={onSubmitHandler} className="support-form">
                        <div className="form-row">
                            <div className="input-field">
                                <label>Your Name</label>
                                <div className="input-wrapper">
                                    <input required name='name' onChange={onChangeHandler} value={formData.name} type="text" placeholder="John Doe" />
                                </div>
                            </div>
                            <div className="input-field">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <input required name='email' onChange={onChangeHandler} value={formData.email} type="email" placeholder="john@example.com" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="input-field">
                                <label>Subject</label>
                                <div className="input-wrapper">
                                    <input required name='subject' onChange={onChangeHandler} value={formData.subject} type="text" placeholder="How can we help?" />
                                </div>
                            </div>
                            <div className="input-field">
                                <label>Category</label>
                                <div className="input-wrapper">
                                    <Tag className="select-icon" size={16} />
                                    <select name="category" onChange={onChangeHandler} value={formData.category} required>
                                        <option value="Product Question">Product Question</option>
                                        <option value="Order Issue">Order Issue</option>
                                        <option value="Payment Issue">Payment Issue</option>
                                        <option value="Custom jewellery">Custom jewellery</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="input-field full-width">
                            <label>Message</label>
                            <div className="input-wrapper">
                                <textarea required name='message' onChange={onChangeHandler} value={formData.message} rows="5" placeholder="Please describe your inquiry in detail..."></textarea>
                            </div>
                        </div>

                        <button type='submit' className="support-submit-btn" disabled={loading}>
                            {loading ? <span className="loader"></span> : <>Submit Inqury <Send size={18} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Support;
