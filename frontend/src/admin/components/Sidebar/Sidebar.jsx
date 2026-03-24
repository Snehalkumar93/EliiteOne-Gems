import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, PlusCircle, ListOrdered, 
    ShoppingBag, HelpCircle, Star, Ticket
} from 'lucide-react';

const Sidebar = () => {
    return (
        <div className='sidebar-luxury'>
            <div className='sidebar-menu'>
                <NavLink to='/admin' end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <p>Dashboard</p>
                </NavLink>
                
                <NavLink to='/admin/add' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <PlusCircle size={20} />
                    <p>Add jewellery</p>
                </NavLink>
                
                <NavLink to='/admin/list' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <ListOrdered size={20} />
                    <p>Master Collection</p>
                </NavLink>
                
                <NavLink to='/admin/orders' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <ShoppingBag size={20} />
                    <p>Order Queue</p>
                </NavLink>
                
                <div className='sidebar-divider'>Customer Relations</div>
                
                <NavLink to='/admin/support' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <HelpCircle size={20} />
                    <p>Support Vault</p>
                </NavLink>
                
                <NavLink to='/admin/reviews' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Star size={20} />
                    <p>Client Feedback</p>
                </NavLink>

                <NavLink to='/admin/coupons' className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
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
