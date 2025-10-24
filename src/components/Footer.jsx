import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  LinkedIn,
  Phone,
  Email,
  LocationOn,
  Pets
} from '@mui/icons-material';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="text-white py-5 mt-5"
      style={{ 
        background: 'var(--gradient-primary)',
        position: 'relative'
      }}
    >
      {/* Decorative wave */}
      <div 
        style={{
          position: 'absolute',
          top: '-1px',
          left: 0,
          right: 0,
          height: '50px',
          background: 'var(--light-color)',
          clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 80%)'
        }}
      />
      
      <Container className="position-relative">
        <Row className="g-4">
          {/* Brand Section */}
          <Col lg={4} className="mb-4">
            <div className="d-flex align-items-center mb-3">
              <Pets style={{ fontSize: '2rem', marginRight: '10px' }} />
              <h4 className="fw-bold mb-0">PetStore</h4>
            </div>
            <p className="mb-3 opacity-90">
              Your trusted companion for premium pet accessories and essentials. 
              We believe every pet deserves the best care and love.
            </p>
            <div className="d-flex gap-3">
              <a 
                href="#" 
                className="social-icon d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Facebook />
              </a>
              <a 
                href="#" 
                className="social-icon d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Instagram />
              </a>
              <a 
                href="#" 
                className="social-icon d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Twitter />
              </a>
              <a 
                href="#" 
                className="social-icon d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <LinkedIn />
              </a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link 
                  to="/" 
                  className="text-white text-decoration-none opacity-90"
                  style={{ transition: 'opacity 0.3s ease' }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/products" 
                  className="text-white text-decoration-none opacity-90"
                  style={{ transition: 'opacity 0.3s ease' }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Products
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/contact" 
                  className="text-white text-decoration-none opacity-90"
                  style={{ transition: 'opacity 0.3s ease' }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Contact
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/cart" 
                  className="text-white text-decoration-none opacity-90"
                  style={{ transition: 'opacity 0.3s ease' }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Cart
                </Link>
              </li>
            </ul>
          </Col>

          {/* Categories */}
          <Col lg={2} md={6} className="mb-4">
            <h6 className="fw-bold mb-3">Categories</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link 
                  to="/products?category=Food" 
                  className="text-white text-decoration-none opacity-90"
                  style={{ transition: 'opacity 0.3s ease' }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Pet Food
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/products?category=Toys" 
                  className="text-white text-decoration-none opacity-90"
                  style={{ transition: 'opacity 0.3s ease' }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Toys
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/products?category=Accessories" 
                  className="text-white text-decoration-none opacity-90"
                  style={{ transition: 'opacity 0.3s ease' }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Accessories
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  to="/products?category=Health" 
                  className="text-white text-decoration-none opacity-90"
                  style={{ transition: 'opacity 0.3s ease' }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                  Health Care
                </Link>
              </li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col lg={4} className="mb-4">
            <h6 className="fw-bold mb-3">Get In Touch</h6>
            <div className="d-flex align-items-center mb-2">
              <Phone className="me-2" style={{ fontSize: '1.2rem' }} />
              <span className="opacity-90">+91 12345 67890</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <Email className="me-2" style={{ fontSize: '1.2rem' }} />
              <span className="opacity-90">contact@petstore.com</span>
            </div>
            <div className="d-flex align-items-start mb-3">
              <LocationOn className="me-2 mt-1" style={{ fontSize: '1.2rem' }} />
              <span className="opacity-90">
                123 Pet Street, Animal City<br />
                Pet State, 12345
              </span>
            </div>
            
            {/* Newsletter Signup */}
            <div 
              className="p-3 rounded mt-3"
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h6 className="fw-bold mb-2">Newsletter</h6>
              <p className="small mb-2 opacity-90">
                Get updates on new products and special offers!
              </p>
              <div className="d-flex gap-2">
                <input 
                  type="email" 
                  className="form-control form-control-sm" 
                  placeholder="Your email"
                  style={{ 
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none'
                  }}
                />
                <Button size="sm" className="btn-pet-secondary">
                  Subscribe
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Bottom Section */}
        <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '3rem 0 2rem' }} />
        <Row className="align-items-center">
          <Col md={8}>
            <p className="mb-0 opacity-90">
              © {currentYear} PetStore. All rights reserved. | 
              <a href="#" className="text-white text-decoration-none ms-1 me-1">Privacy Policy</a> | 
              <a href="#" className="text-white text-decoration-none ms-1 me-1">Terms of Service</a> | 
              <a href="#" className="text-white text-decoration-none ms-1">Support</a>
            </p>
          </Col>
          <Col md={4} className="text-md-end">
            <p className="mb-0 small opacity-75">
              Made with ❤️ for pet lovers
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
