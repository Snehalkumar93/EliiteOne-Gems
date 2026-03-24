import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StoreContext } from '../Context/StoreContext';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import './Admin.css';

const AdminLayout = () => {
    const { role, token } = useContext(StoreContext);

    if (!token || role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className='admin-layout'>
            <Navbar />
            <div className="admin-content">
                <Sidebar />
                <div className="admin-main-viewport">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
