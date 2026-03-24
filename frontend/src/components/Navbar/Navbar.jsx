import { useContext, useEffect, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { Search, ShoppingBag, User, Package, LogOut, LifeBuoy, LayoutDashboard } from 'lucide-react';

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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

  return (
    <div className='navbar'>
      <Link to='/'><img className='logo' src={assets.logo} alt="" /></Link>
      <ul className="navbar-menu">
        <Link to="/" onClick={() => setMenu("home")} className={`${menu === "home" ? "active" : ""}`}>home</Link>
        <span onClick={() => { setMenu("menu"); handleScroll('explore-menu'); }} className={`${menu === "menu" ? "active" : ""}`}>collections</span>
        <span onClick={() => { setMenu("contact"); handleScroll('footer'); }} className={`${menu === "contact" ? "active" : ""}`}>contact us</span>
      </ul>
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
      </div>
    </div>
  )
}

export default Navbar
