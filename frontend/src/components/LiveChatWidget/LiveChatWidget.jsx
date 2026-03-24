import { useState, useRef, useEffect } from 'react';
import './LiveChatWidget.css';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const LiveChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "Greetings from EliteOne Gems. I am your concierge assistant. How may I assist you with our exquisite collections today?", 
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!message.trim()) return;

        const userMsg = message.trim();
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const newMessages = [...messages, { id: Date.now(), text: userMsg, sender: 'user', time: currentTime }];
        setMessages(newMessages);
        setMessage('');
        setLoading(true);

        const lowerMsg = userMsg.toLowerCase();

        setTimeout(() => {
            let botReply = "I'm sorry, I didn't quite catch that. Would you like to know about our Bespoke Services, Shipping Policies, or perhaps speak with a Specialist?";
            
            if (lowerMsg.includes('ship') || lowerMsg.includes('deliver') || lowerMsg.includes('track') || lowerMsg.includes('time')) {
                botReply = "We provide complimentary, fully insured concierge shipping on all orders. Domestic delivery typically arrives within 3 to 5 business days, while international orders may take 7 to 10 days.";
            } else if (lowerMsg.includes('return') || lowerMsg.includes('refund') || lowerMsg.includes('exchange')) {
                botReply = "EliteOne Gems offers a 30-day window for returns or exchanges. Items must remain in their original, pristine condition with all certifications intact.";
            } else if (lowerMsg.includes('size') || lowerMsg.includes('sizing') || lowerMsg.includes('ring')) {
                botReply = "To ensure a perfect fit, we offer virtual sizing consultations and can send a professional ring sizer to your residence. Please let us know if you'd like to arrange this.";
            } else if (lowerMsg.includes('support') || lowerMsg.includes('ticket') || lowerMsg.includes('specialist') || lowerMsg.includes('agent') || lowerMsg.includes('help')) {
                botReply = "For personalized assistance, our jewellery specialists are available via our Support Ticket system. You can easily submit a request in the Support section of your dashboard.";
            } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
                botReply = "Welcome back. It's a pleasure to assist you. What can I do for you today?";
            } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('discount')) {
                botReply = "Our pricing reflects the exceptional quality and craftsmanship of our gems. For exclusive offers and collections, please ensure you are signed in to your account.";
            }

            setMessages(prev => [...prev, { 
                id: Date.now(), 
                text: botReply, 
                sender: 'bot', 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
            setLoading(false);
        }, 1500);
    };

    const handleQuickAction = (action) => {
        setMessage(action);
    };

    return (
        <div className="live-chat-wrapper">
            {isOpen && (
                <div className="chat-window-luxury">
                    <div className="chat-header-luxury">
                        <div className="bot-info">
                            <div className="bot-avatar">
                                <Bot size={20} />
                                <span className="online-indicator"></span>
                            </div>
                            <div className="bot-details">
                                <h4>EliteOne Concierge</h4>
                                <span>Online • Always available</span>
                            </div>
                        </div>
                        <button onClick={toggleChat} className="close-btn-luxury">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-body-luxury">
                        {messages.map(msg => (
                            <div key={msg.id} className={`msg-container ${msg.sender === 'bot' ? 'bot-container' : 'user-container'}`}>
                                <div className={`msg-bubble ${msg.sender === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
                                    <p>{msg.text}</p>
                                    <span className="msg-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="bot-container">
                                <div className="bot-bubble typing-bubble">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-footer-luxury">
                        <div className="quick-actions">
                            <button onClick={() => handleQuickAction('Shipping Info')}>Shipping</button>
                            <button onClick={() => handleQuickAction('Return Policy')}>Returns</button>
                            <button onClick={() => handleQuickAction('Contact Specialist')}>Support</button>
                        </div>
                        <form onSubmit={handleSendMessage} className="msg-input-area">
                            <input 
                                type="text" 
                                placeholder="Type your message here..." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="submit" disabled={loading || !message.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                        <p className="footer-copyright">EliteOne Gems • Secure Concierge Chat</p>
                    </div>
                </div>
            )}

            <div className={`chat-launcher-luxury ${isOpen ? 'active' : ''}`} onClick={toggleChat}>
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                {!isOpen && <span className="unread-dot">1</span>}
            </div>
        </div>
    );
};

export default LiveChatWidget;
