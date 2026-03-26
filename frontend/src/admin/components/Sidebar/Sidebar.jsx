import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, PlusCircle, ListOrdered, 
    ShoppingBag, HelpCircle, Star, Ticket, X
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    return (
        <div className={`sidebar-luxury ${isSidebarOpen ? 'open' : ''}`}>
            <div className='sidebar-mobile-header'>
                <h3>Elite Admin</h3>
                <button onClick={() => setIsSidebarOpen(false)} className='close-sidebar-btn'><X size={24} /></button>
            </div>
            <div className='sidebar-menu'>
                <NavLink onClick={() => setIsSidebarOpen(false)} to='/admin' end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <p>Dashboard</p>
                </NavLink>
                
                <NavLink onClick={() => setIsSidebarOpen(false)} to='/admin/add' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <PlusCircle size={20} />
                    <p>Add jewellery</p>
                </NavLink>
                
                <NavLink onClick={() => setIsSidebarOpen(false)} to='/admin/list' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <ListOrdered size={20} />
                    <p>Master Collection</p>
                </NavLink>
                
                <NavLink onClick={() => setIsSidebarOpen(false)} to='/admin/orders' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <ShoppingBag size={20} />
                    <p>Order Queue</p>
                </NavLink>
                
                <div className='sidebar-divider'>Customer Relations</div>
                
                <NavLink onClick={() => setIsSidebarOpen(false)} to='/admin/support' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <HelpCircle size={20} />
                    <p>Support Vault</p>
                </NavLink>
                
                <NavLink onClick={() => setIsSidebarOpen(false)} to='/admin/reviews' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Star size={20} />
                    <p>Client Feedback</p>
                </NavLink>

                <NavLink onClick={() => setIsSidebarOpen(false)} to='/admin/coupons' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Ticket size={20} />
                    <p>Promotional Vault</p>
                </NavLink>
            </div>

            <div className='sidebar-footer'>
                <p>© 2026 Admin Portal</p>
                <span>EliteOne Gems v1.2</span>
            </div>
        </div>
    );
};

export default Sidebar;
