import { useEffect, useState, useContext, useCallback } from 'react';
import './List.css';
import { StoreContext } from '../../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Trash2, Package, Tag, Diamond, Layers, Eye, RefreshCw } from 'lucide-react';

const List = () => {
    const { url, currency, token } = useContext(StoreContext);
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchList = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/jewellery/list`);
            if (response.data.success) {
                setList(response.data.data);
            } else {
                toast.error("Failed to fetch jewellery list");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading inventory");
        } finally {
            setLoading(false);
        }
    }, [url]);

    const removejewellery = async (jewelleryId) => {
        try {
            const response = await axios.post(`${url}/api/jewellery/remove`, 
                { id: jewelleryId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchList();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to remove item");
        }
    };

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    if (loading) {
        return <div className="admin-loading">Unveiling your collection...</div>;
    }

    return (
        <div className='admin-list-page'>
            <div className='admin-list-header'>
                <div className='header-titles'>
                    <h1>Masterpiece Inventory</h1>
                    <p>Manage and audit your collection of high-end luxury jewellery.</p>
                </div>
                <button onClick={fetchList} className='refresh-btn'>
                    <RefreshCw size={18} />
                    <span>Sync Inventory</span>
                </button>
            </div>

            <div className='inventory-table-container'>
                <div className="inventory-header-row">
                    <span><Eye size={16} /> Image</span>
                    <span><Tag size={16} /> Asset Name</span>
                    <span><Layers size={16} /> Collection</span>
                    <span><Diamond size={16} /> Material</span>
                    <span><Package size={16} /> Stock</span>
                    <span>Price</span>
                    <span className='text-center'>Actions</span>
                </div>

                <div className='inventory-body'>
                    {list.length === 0 ? (
                        <div className="no-items-msg">No pieces found in your collection.</div>
                    ) : (
                        list.map((item, index) => (
                            <div key={index} className='inventory-row'>
                                <div className='item-img-cell'>
                                    <img src={item.image?.startsWith('http') || item.image?.startsWith('data:') ? item.image : `${url}/images/${item.image}`} alt={item.name} />
                                </div>
                                <div className='item-name-cell'>
                                    <p className='primary-text'>{item.name}</p>
                                    <p className='secondary-text'>UID: {item._id.slice(-6).toUpperCase()}</p>
                                </div>
                                <div className='item-category-cell'>
                                    <span className='category-badge-admin'>{item.category}</span>
                                </div>
                                <div className='item-material-cell'>
                                    <p>{item.material}</p>
                                    <span className='purity-text'>{item.purity}</span>
                                </div>
                                <div className='item-stock-cell'>
                                    <p className={item.stock < 5 ? 'low-stock' : ''}>
                                        {item.stock} <small>pcs</small>
                                    </p>
                                </div>
                                <div className='item-price-cell'>
                                    <p className='price-text-admin'>{currency}{item.price.toLocaleString()}</p>
                                </div>
                                <div className='item-actions-cell'>
                                    <button onClick={() => removejewellery(item._id)} className='delete-btn-admin' title="Remove from collection">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default List;
