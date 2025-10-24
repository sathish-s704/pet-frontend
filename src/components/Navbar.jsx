import { useState } from 'react';
import { 
  Navbar, 
  Nav, 
  Container, 
  Button, 
  Form, 
  InputGroup, 
  Badge,
  Dropdown
} from 'react-bootstrap';
import { 
  ShoppingCart, 
  Search, 
  Person, 
  AdminPanelSettings,
  FavoriteBorder,
  Logout,
  Dashboard,
  StorefrontRounded,
  Star
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function NavigationBar() {
  const { user, setUser } = useAuth();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <Navbar 
      expand="lg" 
      className="navbar-modern shadow-sm sticky-top"
      data-aos="fade-down"
    >
      <Container>
        <Navbar.Brand 
          as={Link} 
          to="/" 
          className="navbar-brand d-flex align-items-center"
          style={{ textDecoration: 'none' }}
        >
          <StorefrontRounded 
            className="me-2" 
            style={{ 
              fontSize: '2rem', 
              color: 'var(--primary-color)'
            }} 
          />
          <span 
            className="fw-bold"
            style={{ 
              color: 'var(--primary-color)',
              fontSize: '1.75rem',
              fontFamily: 'Playfair Display, serif'
            }}
          >
            PetStore
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="navbar-nav"
          style={{
            border: 'none',
            boxShadow: 'none'
          }}
        />
        
        <Navbar.Collapse id="navbar-nav">
          {/* Navigation Links */}
          <Nav className="me-auto ms-4">
            <Nav.Link 
              as={Link} 
              to="/" 
              className="nav-link fw-medium px-3 mx-1"
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/products" 
              className="nav-link fw-medium px-3 mx-1"
            >
              Products
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/contact" 
              className="nav-link fw-medium px-3 mx-1"
            >
              Contact
            </Nav.Link>
          </Nav>

          {/* Search Bar */}
          <Form onSubmit={handleSearch} className="d-flex me-3">
            <InputGroup className="modern-search">
              <Form.Control
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control-modern"
                style={{ 
                  borderRadius: 'var(--border-radius-full) 0 0 var(--border-radius-full)',
                  border: '2px solid var(--gray-200)',
                  minWidth: '200px',
                  fontSize: '0.875rem'
                }}
              />
              <Button 
                type="submit" 
                className="btn-modern-primary"
                style={{ 
                  borderRadius: '0 var(--border-radius-full) var(--border-radius-full) 0',
                  border: 'none',
                  padding: '0.75rem 1rem'
                }}
              >
                <Search style={{ fontSize: '1.2rem' }} />
              </Button>
            </InputGroup>
          </Form>

          {/* Right Side Icons */}
          <Nav className="align-items-center">
            {/* Wishlist - Hidden for Admin */}
            {user?.role !== 'admin' && (
              <Nav.Link 
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    alert('Please login to view your wishlist!');
                    return;
                  }
                }}
                as={Link} 
                to="/wishlist" 
                className="position-relative me-3 nav-icon"
                title="Wishlist"
              >
                <div 
                  className="icon-wrapper"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FavoriteBorder 
                    style={{ 
                      fontSize: '1.3rem', 
                      color: 'var(--gray-600)'
                    }} 
                  />
                </div>
                {wishlist.length > 0 && (
                  <Badge 
                    bg="danger" 
                    pill 
                    className="position-absolute"
                    style={{ 
                      fontSize: '0.7rem',
                      top: '-2px',
                      right: '-2px'
                    }}
                  >
                    {wishlist.length}
                  </Badge>
                )}
              </Nav.Link>
            )}

            {/* Shopping Cart - Hidden for Admin */}
            {user?.role !== 'admin' && (
              <Nav.Link 
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    alert('Please login to view your cart!');
                    return;
                  }
                }}
                as={Link} 
                to="/cart" 
                className="position-relative me-3 nav-icon"
                title="Shopping Cart"
              >
                <div 
                  className="icon-wrapper"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ShoppingCart 
                    style={{ 
                      fontSize: '1.3rem', 
                      color: 'var(--gray-600)'
                    }} 
                  />
                </div>
                {cartItemCount > 0 && (
                  <Badge 
                    bg="danger" 
                    pill 
                    className="position-absolute"
                    style={{ 
                      fontSize: '0.7rem',
                      top: '-2px',
                      right: '-2px'
                    }}
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Nav.Link>
            )}

            {/* User Authentication */}
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  as="div" 
                  className="d-flex align-items-center cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  <div 
                    className="user-profile d-flex align-items-center px-3 py-2"
                    style={{ 
                      background: 'var(--gradient-primary)',
                      borderRadius: 'var(--border-radius-full)',
                      color: 'white',
                      fontWeight: '500',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div 
                      className="user-avatar me-2"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Person style={{ fontSize: '1.2rem' }} />
                    </div>
                    <span className="user-name">{user.name || 'User'}</span>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu 
                  className="card-modern"
                  style={{ 
                    border: 'none',
                    borderRadius: 'var(--border-radius-xl)',
                    minWidth: '220px',
                    boxShadow: 'var(--shadow-xl)',
                    padding: '0.5rem 0'
                  }}
                >
                  <Dropdown.Header 
                    className="fw-bold"
                    style={{ 
                      color: 'var(--gray-700)',
                      fontFamily: 'Playfair Display, serif'
                    }}
                  >
                    Welcome, {user.name}!
                  </Dropdown.Header>
                  
                  <Dropdown.Item 
                    as={Link} 
                    to="/profile"
                    className="dropdown-item-modern d-flex align-items-center py-2 px-3"
                  >
                    <Person className="me-3" style={{ color: 'var(--primary-color)' }} />
                    My Profile
                  </Dropdown.Item>

                  {/* Hide wishlist for admin users */}
                  {user.role !== 'admin' && (
                    <>
                      <Dropdown.Item 
                        onClick={(e) => {
                          if (!user) {
                            e.preventDefault();
                            alert('Please login to view your wishlist!');
                            return;
                          }
                        }}
                        as={Link} 
                        to="/wishlist"
                        className="dropdown-item-modern d-flex align-items-center py-2 px-3"
                      >
                        <FavoriteBorder className="me-3" style={{ color: 'var(--secondary-color)' }} />
                        My Wishlist
                        {wishlist.length > 0 && (
                          <Badge bg="warning" className="ms-auto">
                            {wishlist.length}
                          </Badge>
                        )}
                      </Dropdown.Item>

                      <Dropdown.Item 
                        as={Link} 
                        to="/my-reviews"
                        className="dropdown-item-modern d-flex align-items-center py-2 px-3"
                      >
                        <Star className="me-3" style={{ color: 'var(--warning-color)' }} />
                        My Reviews
                      </Dropdown.Item>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <Dropdown.Item 
                      as={Link} 
                      to="/admin/dashboard"
                      className="dropdown-item-modern d-flex align-items-center py-2 px-3"
                    >
                      <Dashboard className="me-3" style={{ color: 'var(--accent-color)' }} />
                      Admin Dashboard
                    </Dropdown.Item>
                  )}

                  <Dropdown.Divider style={{ margin: '0.5rem 0' }} />
                  
                  <Dropdown.Item 
                    onClick={handleLogout}
                    className="dropdown-item-modern d-flex align-items-center py-2 px-3 text-danger"
                  >
                    <Logout className="me-3" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button 
                  as={Link} 
                  to="/login" 
                  className="btn-modern-outline"
                  size="sm"
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  className="btn-modern-primary"
                  size="sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* CSS styles are handled in App.css or component-specific CSS files */}
    </Navbar>
  );
}

export default NavigationBar;
