import './Navbar.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../../Context/StoreContext';
import AdminHeaderIcons from '../AdminHeaderIcons/AdminHeaderIcons';
import { useContext } from 'react';

const Navbar = () => {
    const { url } = useContext(StoreContext);
    const profileImage = null; // We can expand this later to get from context if available
    return (
        <div className='navbar-luxury'>
            <div className='nav-left'>
                <img className='logo' src={assets.logo} alt="EliteOne Gems" />
                <div className='brand-info'>
                    <h3>EliteOne Gems</h3>
                    <span>Administrative Suite</span>
                </div>
            </div>

            <div className='nav-right'>
                <AdminHeaderIcons />
            </div>
        </div>
    );
};

export default Navbar;
