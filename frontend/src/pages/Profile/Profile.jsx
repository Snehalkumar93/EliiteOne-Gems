import { useContext, useEffect, useState, useCallback, useRef } from 'react'
import './Profile.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, User, ShieldCheck, Headset, LayoutDashboard, LogOut, Camera, Inbox, Bot } from 'lucide-react';

const Profile = () => {
    const { url, token, setToken, role, setRole, currency, userData, setUserData } = useContext(StoreContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('account');
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        topProducts: [],
        monthlyRevenue: [],
        topCategories: []
    });
    const [loadingStats, setLoadingStats] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const fileInputRef = useRef(null);

    const fetchProfile = useCallback(async () => {
        try {
            const response = await axios.get(url + "/api/user/me", { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setUserData(response.data.data);
                setFormData({
                    name: response.data.data.name,
                    email: response.data.data.email,
                    password: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching profile");
        }
    }, [token, url]);

    const fetchTickets = useCallback(async () => {
        setLoadingTickets(true);
        try {
            const response = await axios.get(url + "/api/support/user", { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setTickets(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoadingTickets(false);
        }
    }, [token, url]);

    const fetchAnalytics = useCallback(async () => {
        setLoadingStats(true);
        try {
            const response = await axios.get(`${url}/api/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching analytics", error);
        } finally {
            setLoadingStats(false);
        }
    }, [token, url]);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        fetchProfile();
    }, [fetchProfile, navigate, token]);

    useEffect(() => {
        if (activeTab === 'support' && token) {
            fetchTickets();
        } else if (activeTab === 'admin' && token && role === 'admin') {
            fetchAnalytics();
        }
    }, [activeTab, fetchAnalytics, fetchTickets, role, token]);

    const handleImageClick = (e) => {
        e.stopPropagation();
        fileInputRef.current.click();
    }

    const openProfilePreview = () => {
        setIsPreviewOpen(true);
    }

    const closeProfilePreview = () => {
        setIsPreviewOpen(false);
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);

            const imageFormData = new FormData();
            imageFormData.append("image", file);
            setIsUploading(true);
            try {
                const response = await axios.put(url + "/api/user/upload-image", imageFormData, { headers: { Authorization: `Bearer ${token}` } });
                if (response.data.success) {
                    toast.success("Profile picture updated");
                    setUserData(response.data.data);
                    setImagePreview(null);
                }
            } catch (error) {
                toast.error("Upload failed");
            } finally {
                setIsUploading(false);
            }
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (activeTab === 'security' && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const response = await axios.put(url + "/api/user/profile", formData, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                toast.success("Profile updated successfully");
                setUserData(response.data.data);
                setIsEditing(false);
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Update failed");
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userData");
        setToken("");
        setRole("");
        setUserData(null);
        navigate('/');
    }

    const COLORS = ['#9333ea', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    if (!userData) return <div className='profile-loading'>Loading...</div>;

    return (
        <div className='profile-page-container'>
            <div className="profile-sidebar">
                <div className="sidebar-header">
                    <div className='avatar-container' onClick={openProfilePreview}>
                        <img src={imagePreview || (userData.profileImage ? url + "/images/profile/" + userData.profileImage : assets.profile_icon)} alt="Profile" />
                        <div className="avatar-edit-icon" onClick={handleImageClick}>
                            <Camera size={16} />
                        </div>
                        {isUploading && <div className="avatar-spin"></div>}
                    </div>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                    <h3>{userData.name}</h3>
                    <p>{userData.email}</p>
                    {role === 'admin' && <span className="admin-pill">Admin Access</span>}
                </div>
                
                <nav className="sidebar-nav">
                    <button className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>
                        <User size={18} /> Account Settings
                    </button>
                    <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                        <ShieldCheck size={18} /> Security
                    </button>
                    <button className={activeTab === 'support' ? 'active' : ''} onClick={() => setActiveTab('support')}>
                        <Headset size={18} /> Support Tickets
                    </button>
                    {role === 'admin' && (
                        <button className={activeTab === 'admin' ? 'active' : ''} onClick={() => setActiveTab('admin')}>
                            <LayoutDashboard size={18} /> Sales Analytics
                        </button>
                    )}
                    <hr />
                    <button className="logout-nav-btn" onClick={logout}>
                        <LogOut size={18} /> Logout
                    </button>
                </nav>
            </div>

            <div className="profile-content">
                {activeTab === 'account' && (
                    <div className="content-card animate-fade">
                        <div className="card-header">
                            <h2>Personal Information</h2>
                            {!isEditing && <button className="card-edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>}
                        </div>
                        <form onSubmit={handleUpdate} className="profile-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing} 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input 
                                        type="email" 
                                        disabled={!isEditing} 
                                        value={formData.email} 
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                        placeholder="Your Email"
                                    />
                                </div>
                            </div>
                            {isEditing && (
                                <div className="form-actions">
                                    <button type="submit" className="save-btn">Save Changes</button>
                                    <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            )}
                        </form>
                        <div className="account-meta">
                            <p>Member Since: <span>{new Date(userData.createdAt).toLocaleDateString()}</span></p>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="content-card animate-fade">
                        <div className="card-header">
                            <h2>Security Settings</h2>
                        </div>
                        <form onSubmit={handleUpdate} className="profile-form">
                            <p className="security-note">Update your password to keep your account secure.</p>
                            <div className="form-group">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    value={formData.password} 
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    value={formData.confirmPassword} 
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <button type="submit" className="save-btn" style={{marginTop: '10px'}}>Update Password</button>
                        </form>
                    </div>
                )}

                {activeTab === 'support' && (
                    <div className="content-card animate-fade">
                        <div className="card-header">
                            <h2>My Support Tickets</h2>
                            <button className="new-ticket-btn" onClick={() => navigate('/support')}>New Ticket</button>
                        </div>
                        {loadingTickets ? (
                            <div className="tickets-loader">Loading tickets...</div>
                        ) : tickets.length === 0 ? (
                            <div className="empty-tickets">
                                <Inbox size={40} />
                                <p>No support tickets found.</p>
                            </div>
                        ) : (
                        <div className="tickets-list">
                            {tickets.map(ticket => (
                                <div key={ticket._id} className="ticket-item-luxury">
                                    <div className="ticket-header">
                                        <div className="ticket-meta-group">
                                            <span className={`status-pill-luxury ${ticket.status}`}>{ticket.status}</span>
                                            <span className="category-tag">{ticket.category}</span>
                                        </div>
                                        <span className="ticket-date-luxury">{new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="ticket-body-content">
                                        <h4>{ticket.subject}</h4>
                                        <div className="user-message-luxury">
                                            <div className="avatar-mini"><User size={12} /></div>
                                            <p>{ticket.message}</p>
                                        </div>
                                        {ticket.adminReply && (
                                            <div className="concierge-reply-luxury">
                                                <div className="concierge-avatar-mini"><Bot size={12} /></div>
                                                <div className="reply-text-group">
                                                    <span className="reply-label">Concierge Response</span>
                                                    <p>{ticket.adminReply}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                )}

                {activeTab === 'admin' && role === 'admin' && (
                    <div className="content-card analytics-card animate-fade">
                        <div className="card-header">
                            <h2>Sales & Business Analytics</h2>
                            <p className="subtitle">Real-time performance insights from your jewellery store.</p>
                        </div>
                        {loadingStats ? (
                            <div className="stats-loader">Loading performance data...</div>
                        ) : (
                            <div className="profile-admin-dashboard">
                                <div className='stats-grid'>
                                    <div className='stat-card gold'>
                                        <div className='stat-icon blue'><DollarSign size={20} /></div>
                                        <div className='stat-info'>
                                            <p>Gross Revenue</p>
                                            <h3>{currency}{stats.totalSales.toLocaleString()}</h3>
                                        </div>
                                    </div>
                                    <div className='stat-card'>
                                        <div className='stat-icon green'><ShoppingBag size={20} /></div>
                                        <div className='stat-info'>
                                            <p>Total Orders</p>
                                            <h3>{stats.totalOrders}</h3>
                                        </div>
                                    </div>
                                    <div className='stat-card'>
                                        <div className='stat-icon purple'><TrendingUp size={20} /></div>
                                        <div className='stat-info'>
                                            <p>Avg. Order Value</p>
                                            <h3>{currency}{stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : 0}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className='charts-grid'>
                                    <div className='chart-item span-full'>
                                        <div className="chart-header">
                                            <h3>Revenue Overview (Last 6 Months)</h3>
                                        </div>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={stats.monthlyRevenue}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                    formatter={(value) => [`${currency}${value}`, 'Revenue']}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="revenue" 
                                                    stroke="url(#lineGradient)" 
                                                    strokeWidth={4} 
                                                    dot={{ r: 4, fill: '#9333ea', strokeWidth: 2, stroke: '#fff' }} 
                                                    activeDot={{ r: 6, strokeWidth: 0 }} 
                                                />
                                                <defs>
                                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#9333ea" />
                                                        <stop offset="100%" stopColor="#ec4899" />
                                                    </linearGradient>
                                                </defs>
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className='chart-item'>
                                        <div className="chart-header">
                                            <h3>Top Selling Products</h3>
                                        </div>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={stats.topProducts}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                                <Bar dataKey="quantity" fill="#9333ea" radius={[4, 4, 0, 0]} barSize={25} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className='chart-item'>
                                        <div className="chart-header">
                                            <h3>Sales by Category</h3>
                                        </div>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={stats.topCategories}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {stats.topCategories.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    formatter={(value) => [`${currency}${value}`, 'Sales']}
                                                />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Image Preview Modal */}
            {isPreviewOpen && (
                <div className="profile-image-modal" onClick={closeProfilePreview}>
                    <div className="modal-content-luxury animate-scale" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeProfilePreview}>×</button>
                        <div className="modal-image-wrapper">
                            <img 
                                src={imagePreview || (userData.profileImage ? url + "/images/profile/" + userData.profileImage : assets.profile_icon)} 
                                alt="Profile Full Preview" 
                            />
                        </div>
                        <div className="modal-footer-info">
                            <h4>{userData.name}</h4>
                            <p>Profile Picture</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile
