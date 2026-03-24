import { useContext, useEffect, useState, useCallback } from 'react';
import './MySupport.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ShieldCheck, ArrowLeft, Plus, Bot, User, BadgeInfo } from 'lucide-react';

const MySupport = () => {
    const { url, token } = useContext(StoreContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTickets = useCallback(async () => {
        if (!token) {
            toast.error("Please login to view your support history.");
            navigate('/support');
            return;
        }

        try {
            const response = await axios.get(url + "/api/support/user", { headers: { token } });
            if (response.data.success) {
                setTickets(response.data.data);
            } else {
                toast.error("Failed to fetch tickets");
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            toast.error("Error loading tickets");
        } finally {
            setLoading(false);
        }
    }, [navigate, token, url]);

    useEffect(() => {
        if (token) {
            fetchTickets();
        } else {
            setLoading(false);
        }
    }, [fetchTickets, token]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'open': return 'status-badge open';
            case 'replied': return 'status-badge replied';
            case 'closed': return 'status-badge closed';
            default: return 'status-badge open';
        }
    }

    if (loading) {
        return (
            <div className="support-loading-screen">
                <div className="luxury-spinner"></div>
                <p>Retrieving your concierge history...</p>
            </div>
        );
    }

    return (
        <div className='my-support-luxury-page'>
            <div className="support-nav-header">
                <button onClick={() => navigate('/profile')} className="back-link">
                    <ArrowLeft size={18} /> Back to Profile
                </button>
            </div>

            <div className="support-hero-section">
                <div className="hero-text">
                    <h1>Support Management</h1>
                    <p>Track your inquiries and communications with our EliteOne specialists.</p>
                </div>
                <button onClick={() => navigate('/support')} className="create-ticket-luxury-btn">
                    <Plus size={20} /> New Inquiry
                </button>
            </div>

            <div className="support-dashboard-grid">
                {tickets.length === 0 ? (
                    <div className="empty-support-state">
                        <div className="empty-icon"><MessageSquare size={48} strokeWidth={1} /></div>
                        <h3>No Active Inquiries</h3>
                        <p>Your support history is currently clear. If you require assistance, our specialists are ready to help.</p>
                        <button onClick={() => navigate('/support')} className="btn-luxury-outline">Start an Inquiry</button>
                    </div>
                ) : (
                    <div className="tickets-grid">
                        {tickets.map((ticket) => (
                            <div key={ticket._id} className="luxury-ticket-card">
                                <div className="card-top-header">
                                    <div className="meta-group">
                                        <Clock size={14} />
                                        <span>{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <span className={getStatusClass(ticket.status)}>
                                        {ticket.status ? ticket.status.toUpperCase() : "OPEN"}
                                    </span>
                                </div>
                                
                                <div className="ticket-main-content">
                                    <div className="category-tag-mini">{ticket.category}</div>
                                    <h3>{ticket.subject}</h3>
                                    
                                    <div className="message-thread">
                                        <div className="user-message-bubble">
                                            <div className="bubble-header">
                                                <User size={14} />
                                                <span>Your Request</span>
                                            </div>
                                            <p>{ticket.message}</p>
                                        </div>

                                        {ticket.adminReply && (
                                            <div className="concierge-reply-bubble">
                                                <div className="bubble-header">
                                                    <Bot size={14} />
                                                    <span>EliteOne Specialist</span>
                                                </div>
                                                <p>{ticket.adminReply}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-footer-luxury">
                                    <div className="security-note">
                                        <ShieldCheck size={14} />
                                        <span>Secure Communication</span>
                                    </div>
                                    <div className="ticket-id">#{ticket._id.slice(-6).toUpperCase()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="support-footer-note">
                <BadgeInfo size={16} />
                <p>For urgent matters, please use our Live Concierge Chat or call our boutique directly.</p>
            </div>
        </div>
    );
}

export default MySupport;
