import { useState, useEffect, useContext, useCallback } from 'react';
import './AdminSupport.css';
import axios from 'axios';
import { StoreContext } from '../../../Context/StoreContext';
import { toast } from 'react-toastify';
import { 
    CheckCircle, Clock, 
    User, Calendar, Send,
    LifeBuoy, ShieldCheck, Hash, Mail
} from 'lucide-react';

const AdminSupport = () => {
    const { token, url } = useContext(StoreContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replies, setReplies] = useState({});

    const fetchTickets = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/support/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTickets(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            toast.error("Failed to load support vault");
        } finally {
            setLoading(false);
        }
    }, [token, url]);

    const handleReplyChange = (ticketId, value) => {
        setReplies({ ...replies, [ticketId]: value });
    };

    const submitReply = async (ticketId) => {
        const reply = replies[ticketId];
        if (!reply) return toast.info("Please draft a response first");

        try {
            const response = await axios.put(`${url}/api/support/admin/${ticketId}/reply`, 
                { ticketId, adminReply: reply, status: 'replied' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success("Response dispatched successfully");
                setReplies({ ...replies, [ticketId]: "" });
                fetchTickets();
            }
        } catch (error) {
            toast.error("Failed to send response");
        }
    };

    const closeTicket = async (ticketId) => {
        try {
            const response = await axios.put(`${url}/api/support/admin/${ticketId}/reply`, 
                { ticketId, adminReply: replies[ticketId] || "Ticket resolved and closed.", status: 'closed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success("Security ticket finalized & closed");
                fetchTickets();
            }
        } catch (error) {
            toast.error("Failed to close ticket");
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    if (loading) return <div className="admin-loading">Synchronizing Support Vault...</div>;

    return (
        <div className='admin-support-page'>
            <div className='support-header-luxury'>
                <div className='title-group'>
                    <LifeBuoy className='gold-icon' size={32} />
                    <div>
                        <h1>Support Vault</h1>
                        <p>Resolve client inquiries with administrative excellence.</p>
                    </div>
                </div>
            </div>

            <div className="tickets-grid">
                {tickets.length === 0 ? (
                    <div className="no-tickets-luxury">
                        <ShieldCheck size={48} />
                        <p>The support vault is currently clear.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket._id} className={`ticket-card-luxury ${ticket.status}`}>
                            <div className='ticket-card-header'>
                                <div className='ticket-id-section'>
                                    <Hash size={14} />
                                    <span>{ticket._id.slice(-8).toUpperCase()}</span>
                                    <span className={`status-pill ${ticket.status}`}>
                                        {ticket.status === 'open' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                        {ticket.status}
                                    </span>
                                </div>
                                <div className='ticket-date'>
                                    <Calendar size={14} />
                                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className='ticket-card-body'>
                                <div className='client-intel'>
                                    <div className='intel-item'>
                                        <User size={14} />
                                        <span>{ticket.name}</span>
                                    </div>
                                    <div className='intel-item'>
                                        <Mail size={14} />
                                        <span>{ticket.email}</span>
                                    </div>
                                    <div className='category-indicator'>
                                        {ticket.category}
                                    </div>
                                </div>

                                <h4 className='ticket-subject'>{ticket.subject}</h4>
                                
                                <div className='message-block user'>
                                    <div className='block-label'>Client Inquiry</div>
                                    <p>{ticket.message}</p>
                                </div>

                                {ticket.adminReply && (
                                    <div className='message-block admin'>
                                        <div className='block-label'>Administrative Response</div>
                                        <p>{ticket.adminReply}</p>
                                    </div>
                                )}
                            </div>

                            {ticket.status !== 'closed' && (
                                <div className='ticket-card-footer'>
                                    <div className='reply-input-wrapper'>
                                        <textarea 
                                            placeholder="Draft your executive response..."
                                            value={replies[ticket._id] || ""}
                                            onChange={(e) => handleReplyChange(ticket._id, e.target.value)}
                                        />
                                        <div className='footer-actions'>
                                            <button onClick={() => closeTicket(ticket._id)} className='action-btn-text text-red'>
                                                Finalize & Close
                                            </button>
                                            <button onClick={() => submitReply(ticket._id)} className='action-btn-gold'>
                                                <Send size={14} />
                                                Dispatch Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {ticket.status === 'closed' && (
                                <div className='closed-overlay'>
                                    <CheckCircle size={20} />
                                    <span>Resolution Finalized</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminSupport;
