import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Receipt, User } from 'lucide-react';
import { StoreContext } from '../../../Context/StoreContext';
import './AdminHeaderIcons.css';

const AdminHeaderIcons = () => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { token, role, setToken, setRole, url } = useContext(StoreContext);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        if (setToken) setToken("");
        if (setRole) setRole("");
        navigate('/');
    };

    const handleProfileClick = () => {
        navigate('/admin/profile');
    };

    return (
        <div className="admin-header-icons">

            {/* Notifications */}
            <div className="admin-icon-container">
                <button 
                    className="admin-icon-btn" 
                    title="Notifications"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                    <div className="icon-wrapper">
                        <Bell size={22} strokeWidth={2.5} />
                        <span className="notification-badge"></span>
                    </div>
                </button>

                {isNotificationsOpen && (
                    <div className="admin-dropdown-panel admin-notifications-panel">
                        <div className="admin-dropdown-header">Notifications</div>
                        <ul className="admin-dropdown-list">
                            <li>
                                <div className="admin-notif-content-wrapper">
                                    <p className="admin-notif-title">New Order #892</p>
                                    <p className="admin-notif-desc">Pending fulfillment</p>
                                </div>
                            </li>
                            <li>
                                <div className="admin-notif-content-wrapper">
                                    <p className="admin-notif-title">Low Stock</p>
                                    <p className="admin-notif-desc">Diamond Ring (Size 7)</p>
                                </div>
                            </li>
                            <li>
                                <div className="admin-notif-content-wrapper">
                                    <p className="admin-notif-title">Support Ticket</p>
                                    <p className="admin-notif-desc">Unread message from John</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Billing */}
            <div className="admin-icon-container">
                <button 
                    className="admin-icon-btn" 
                    title="Billing / Offers"
                    onClick={() => navigate('/admin/billing')}
                >
                    <div className="icon-wrapper">
                        <Receipt size={22} strokeWidth={2.5} />
                    </div>
                </button>
            </div>

            {/* Profile */}
            <div className="admin-icon-container">
                <button 
                    className="admin-icon-btn admin-profile-btn" 
                    title="Profile"
                    onClick={handleProfileClick}
                >
                    <div className="icon-wrapper">
                        <User size={22} strokeWidth={2.5} />
                    </div>
                </button>
            </div>

        </div>
    );
};

export default AdminHeaderIcons;