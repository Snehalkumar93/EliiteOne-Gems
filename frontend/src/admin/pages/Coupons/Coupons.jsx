import { useState, useEffect, useContext, useCallback } from 'react';
import './Coupons.css';
import axios from 'axios';
import { StoreContext } from '../../../Context/StoreContext';
import { toast } from 'react-toastify';
import { Ticket, Plus, Trash2, Calendar, Percent, IndianRupee } from 'lucide-react';

const Coupons = () => {
    const { token, url } = useContext(StoreContext);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        expirationDate: ''
    });

    const fetchCoupons = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/coupon/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCoupons(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    }, [token, url]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/api/coupon/create`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success("Coupon created successfully!");
                setShowForm(false);
                setFormData({
                    code: '',
                    discountType: 'percentage',
                    discountValue: '',
                    minOrderAmount: '',
                    expirationDate: ''
                });
                fetchCoupons();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Error creating coupon");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            try {
                const response = await axios.post(`${url}/api/coupon/remove`, { id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    toast.success("Coupon removed");
                    fetchCoupons();
                }
            } catch (error) {
                toast.error("Error deleting coupon");
            }
        }
    };

    return (
        <div className='coupons-page'>
            <div className='coupons-header'>
                <div className='header-info'>
                    <h1>Promotional Vault</h1>
                    <p>Manage luxury discount codes and marketing incentives.</p>
                </div>
                <button className='add-coupon-btn' onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} />
                    <span>{showForm ? 'Close Engine' : 'Generate Code'}</span>
                </button>
            </div>

            {showForm && (
                <div className='coupon-form-container'>
                    <form onSubmit={handleSubmit} className='luxury-form'>
                        <div className='form-grid'>
                            <div className='form-group'>
                                <label>Coupon Code</label>
                                <div className='input-wrapper'>
                                    <Ticket size={18} />
                                    <input 
                                        type="text" 
                                        name="code" 
                                        placeholder="e.g. LUXURY20" 
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <label>Discount Type</label>
                                <select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div className='form-group'>
                                <label>Discount Value</label>
                                <div className='input-wrapper'>
                                    {formData.discountType === 'percentage' ? <Percent size={18} /> : <IndianRupee size={18} />}
                                    <input 
                                        type="number" 
                                        name="discountValue" 
                                        placeholder="Value" 
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <label>Min Order Amount</label>
                                <div className='input-wrapper'>
                                    <IndianRupee size={18} />
                                    <input 
                                        type="number" 
                                        name="minOrderAmount" 
                                        placeholder="Minimum ₹" 
                                        value={formData.minOrderAmount}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <label>Expiration Date</label>
                                <div className='input-wrapper'>
                                    <Calendar size={18} />
                                    <input 
                                        type="date" 
                                        name="expirationDate" 
                                        value={formData.expirationDate}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='form-actions'>
                            <button type="submit" className='submit-btn'>Authorize Promotion</button>
                        </div>
                    </form>
                </div>
            )}

            <div className='coupons-list-container'>
                {loading ? (
                    <div className='loading-msg'>Auditing vault...</div>
                ) : coupons.length === 0 ? (
                    <div className='no-data'>No active promotions found.</div>
                ) : (
                    <div className='coupons-table'>
                        <div className='table-header'>
                            <span>Code</span>
                            <span>Benefit</span>
                            <span>Min Order</span>
                            <span>Expiry</span>
                            <span>Status</span>
                            <span className='text-center'>Actions</span>
                        </div>
                        <div className='table-body'>
                            {coupons.map((coupon) => (
                                <div key={coupon._id} className='table-row'>
                                    <div className='code-cell'>
                                        <Ticket size={16} className='icon-gold' />
                                        <strong>{coupon.code}</strong>
                                    </div>
                                    <div className='benefit-cell'>
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                                    </div>
                                    <div className='min-cell'>₹{coupon.minOrderAmount}</div>
                                    <div className='expiry-cell'>{new Date(coupon.expirationDate).toLocaleDateString()}</div>
                                    <div className='status-cell'>
                                        <span className={`status-badge ${new Date() > new Date(coupon.expirationDate) ? 'expired' : 'active'}`}>
                                            {new Date() > new Date(coupon.expirationDate) ? 'Expired' : 'Active'}
                                        </span>
                                    </div>
                                    <div className='actions-cell'>
                                        <button onClick={() => handleDelete(coupon._id)} className='delete-btn'>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Coupons;
