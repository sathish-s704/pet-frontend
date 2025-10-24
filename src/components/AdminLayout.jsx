import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';
import { Dashboard, ShoppingCart, People, ListAlt, AttachMoney, Logout } from '@mui/icons-material';

const AdminLayout = ({ children }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Access control
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active bg-primary text-white' : '';
  };

  if (!user || user.role !== 'admin') {
    return null; // Don't render anything if not admin
  }

  return (
    <Container fluid className="bg-light min-vh-100 p-0">
      <Row className="g-0">
        {/* Sidebar */}
        <Col md={2} className="bg-white shadow-sm d-flex flex-column min-vh-100 p-3">
          <h4 className="mb-4 text-primary">
            <Dashboard style={{verticalAlign:'middle'}} /> Admin
          </h4>
          <ListGroup variant="flush">
            <ListGroup.Item 
              action 
              className={`border-0 ${getActiveClass('/admin/dashboard')}`}
              onClick={() => navigate('/admin/dashboard')}
            >
              <Dashboard style={{verticalAlign:'middle'}} /> Dashboard
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              className={`border-0 ${getActiveClass('/admin/products')}`}
              onClick={() => navigate('/admin/products')}
            >
              <ShoppingCart style={{verticalAlign:'middle'}} /> Products
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              className={`border-0 ${getActiveClass('/admin/users')}`}
              onClick={() => navigate('/admin/users')}
            >
              <People style={{verticalAlign:'middle'}} /> Users
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              className={`border-0 ${getActiveClass('/admin/orders')}`}
              onClick={() => navigate('/admin/orders')}
            >
              <ListAlt style={{verticalAlign:'middle'}} /> Orders
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              className={`border-0 ${getActiveClass('/admin/income')}`}
              onClick={() => navigate('/admin/income')}
            >
              <AttachMoney style={{verticalAlign:'middle'}} /> Income
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              className="border-0 text-danger" 
              onClick={handleLogout}
            >
              <Logout style={{verticalAlign:'middle'}} /> Logout
            </ListGroup.Item>
          </ListGroup>
        </Col>
        {/* Main Content */}
        <Col md={10} className="p-4">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
