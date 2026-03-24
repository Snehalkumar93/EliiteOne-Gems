import './Header.css'
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleViewCollection = (e) => {
        e.preventDefault();
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById('explore-menu');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            const element = document.getElementById('explore-menu');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    return (
        <div className='header'>
            <div className="header-contents">
        <h2>Exquisite Jewellery for Every Occasion</h2>
        <p>Discover our curated collection of fine jewellery, from timeless diamond rings to elegant gold necklaces. Each piece is crafted with precision and passion to elevate your style and celebrate your most precious moments.</p>
        <button onClick={handleViewCollection}>View Collection</button>
      </div>
        </div>
    )
}

export default Header
