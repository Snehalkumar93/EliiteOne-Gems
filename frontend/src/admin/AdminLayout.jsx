import { useContext, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StoreContext } from '../Context/StoreContext';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import './Admin.css';

const AdminLayout = () => {
    const { role, token } = useContext(StoreContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!token || role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className='admin-layout'>
            <Navbar setIsSidebarOpen={setIsSidebarOpen} />
            <div className="admin-content">
                {isSidebarOpen && (
                    <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
                )}
                <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="admin-main-viewport">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
