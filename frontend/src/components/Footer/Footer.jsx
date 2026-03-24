import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt="" className="footer-logo" />
            <p>At EliteOne Gems, we believe that every piece of jewellery tells a story. Our master craftsmen combine traditional techniques with modern design to create exquisite pieces that celebrate life's most precious moments. Experience the art of luxury.</p>
            <div className="footer-social-section">
                <h3>Follow Us</h3>
                <div className="footer-social-icons">
                    <a href="https://www.facebook.com/share/1CnWhRGN8w/" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <span>f</span>
                    </a>
                    <a href="https://www.instagram.com/eliteone_gems" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <span>in</span>
                    </a>
                    <a href="https://pin.it/6iOUZfseE" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <span>P</span>
                    </a>
                </div>
            </div>
        </div>
        <div className="footer-content-center">
            <h2>COLLECTIONS</h2>
            <ul>
                <li>High Jewellery</li>
                <li>Wedding & Bridal</li>
                <li>Gift Guide</li>
                <li>Our Story</li>
            </ul>
        </div>
        <div className="footer-content-right">
            <h2>GET IN TOUCH</h2>
            <ul>
                <li>+1-800-ELITE-GEM</li>
                <li>eliteonegems@gmail.com</li>
            </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        © {new Date().getFullYear()} EliteOneGems.com. All rights reserved. | Developed by <a href="https://your-portfolio-link.com" target="_blank" rel="noopener noreferrer" className="developer-link">Snehal Kumar</a>
      </p>
    </div>
  )
}

export default Footer
