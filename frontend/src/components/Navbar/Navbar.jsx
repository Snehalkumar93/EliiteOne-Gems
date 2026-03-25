import { useContext, useEffect, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { Search, ShoppingBag, User, Package, LogOut, LifeBuoy, LayoutDashboard, Menu, X } from 'lucide-react';

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { getTotalCartAmount, token, setToken, role, setRole, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
      } else {
        try {
          const response = await axios.get(`${url}/api/jewellery/search?q=${searchTerm}`);
          if (response.data.success) {
            setSearchResults(response.data.data);
          }
        } catch (error) {
          console.error("Search error", error);
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, url]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setRole("");
    navigate('/')
  }

  const handleResultClick = (id) => {
    setSearchTerm("");
    setIsSearchVisible(false);
    navigate(`/product/${id}`);
  }

  // Effect to lock body scroll when mobile menu is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
      document.documentElement.classList.add('mobile-menu-open');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('mobile-menu-open');
      document.documentElement.classList.remove('mobile-menu-open');
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.documentElement.classList.remove('mobile-menu-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className='navbar'>
      <Link to='/'><img className='logo' src={assets.logo} alt="" /></Link>
      {/* Desktop Menu */}
      <ul className="navbar-menu">
        <li onClick={() => { setMenu("home"); navigate('/'); }} className={menu === "home" ? "active" : ""}>home</li>
        <li onClick={() => { setMenu("menu"); handleScroll('explore-menu'); }} className={menu === "menu" ? "active" : ""}>collections</li>
        <li onClick={() => { setMenu("contact"); handleScroll('footer'); }} className={menu === "contact" ? "active" : ""}>contact us</li>
      </ul>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      {/* Mobile Menu Drawer */}
      <div className={`navbar-menu-drawer ${isMobileMenuOpen ? "mobile-active" : ""}`}>
        <div className="mobile-menu-header">
          <img className='logo' src={assets.logo} alt="EliteOne Gems" />
          <div className="close-menu-wrapper" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
            <X className="close-menu-icon" size={24} />
          </div>
        </div>
        
        <nav className="mobile-nav-links">
          <Link to="/" onClick={() => { setMenu("home"); setIsMobileMenuOpen(false); }} className={`mobile-nav-item ${menu === "home" ? "active" : ""}`}>
            <span>Home</span>
          </Link>
          <span onClick={() => { setMenu("menu"); handleScroll('explore-menu'); setIsMobileMenuOpen(false); }} className={`mobile-nav-item ${menu === "menu" ? "active" : ""}`}>
            <span>Collections</span>
          </span>
          <span onClick={() => { setMenu("contact"); handleScroll('footer'); setIsMobileMenuOpen(false); }} className={`mobile-nav-item ${menu === "contact" ? "active" : ""}`}>
            <span>Contact Us</span>
          </span>
        </nav>

        <div className="mobile-menu-footer">
          {!token ? (
            <div className="mobile-auth-container">
              <p className="mobile-menu-note">Join EliteOne Gems for exclusive collections</p>
              <button className="premium-pill-button" onClick={() => { setShowLogin(true); setIsMobileMenuOpen(false); }}>Sign Up / Login</button>
            </div>
          ) : (
            <div className="mobile-auth-container">
              <button className="premium-pill-button outline" onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}>My Profile</button>
              {role === 'admin' && (
                <button className="premium-pill-button admin" onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}>Admin Dashboard</button>
              )}
              <button className="premium-pill-button logout" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>Logout Account</button>
            </div>
          )}
          
          <div className="mobile-brand-section">
            <p className="brand-tagline">Exquisite Jewellery for Every Occasion</p>
            <div className="mobile-social-links">
              {/* Optional Social Icons could go here */}
            </div>
          </div>
        </div>
      </div>
      <div className="navbar-right">
        <div className={`navbar-search-container ${isSearchVisible ? "active" : ""}`}>
          <div className="icon-wrapper" onClick={() => setIsSearchVisible(!isSearchVisible)}>
            <Search className="nav-icon" size={22} strokeWidth={2.5} />
          </div>
          {isSearchVisible && (
            <div className="search-wrapper">
              <input
                autoFocus
                type="text"
                placeholder="Search jewellery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map((item) => (
                    <li key={item._id} onClick={() => handleResultClick(item._id)}>
                      <img src={url + "/images/" + item.image} alt="" />
                      <div>
                        <p className="res-name">{item.name}</p>
                        <p className="res-cat">{item.category}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {searchTerm && searchResults.length === 0 && (
                <div className="search-results no-res">No results found</div>
              )}
            </div>
          )}
        </div>
        
        {token && role === 'admin' && (
          <div className="icon-wrapper" onClick={() => navigate('/admin')} title="Admin Panel" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <LayoutDashboard className="nav-icon" size={22} strokeWidth={2.5} />
          </div>
        )}

        {token && role !== 'admin' && (
          <Link to='/cart' className='navbar-cart-link'>
            <div className="icon-wrapper">
              <ShoppingBag className="nav-icon" size={22} strokeWidth={2.5} />
              {getTotalCartAmount() > 0 && <span className="notification-badge"></span>}
            </div>
          </Link>
        )}
        {!token ? <button onClick={() => setShowLogin(true)}>sign up</button>
          : <div className='navbar-profile'>
            <div className="icon-wrapper">
              <User className="nav-icon" size={22} strokeWidth={2.5} />
            </div>
            <ul className='navbar-profile-dropdown'>
              <li onClick={() => navigate('/profile')}> <User size={18} strokeWidth={2} /> <p>My Profile</p></li>
              <hr />
              {role !== "admin" && (
                <>
                  <li onClick={() => navigate('/myorders')}> <Package size={18} strokeWidth={2} /> <p>Orders</p></li>
                  <hr />
                  <li onClick={() => navigate('/my-support')}> <LifeBuoy size={18} strokeWidth={2} /> <p>Support Tickets</p></li>
                  <hr />
                </>
              )}
              {role === "admin" && (
                <>
                  <li onClick={() => navigate('/admin')}> <LayoutDashboard size={18} strokeWidth={2} /> <p>Admin Panel</p></li>
                  <hr />
                </>
              )}
              <li onClick={logout}> <LogOut size={18} strokeWidth={2} /> <p>Logout</p></li>
            </ul>
          </div>
        }
        <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="nav-icon" size={24} />
        </div>
      </div>
    </div>
  )
}

export default Navbar
