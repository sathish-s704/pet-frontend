import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../utils/api';
import PayPalButton from '../components/PayPalButton';
import ErrorBoundary from '../components/ErrorBoundary';

const ProductCheckout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Try to get product from localStorage if not in state
  useEffect(() => {
    if (!product) {
      const storedProduct = localStorage.getItem('buyNowProduct');
      if (storedProduct) {
        try {
          const parsedProduct = JSON.parse(storedProduct);
          setProduct(parsedProduct);
          console.log('Product loaded from localStorage:', parsedProduct);
        } catch (e) {
          console.error('Error parsing stored product:', e);
        }
      }
    }
  }, [product]);

  const totalAmount = product ? product.price * quantity : 0;

  const getImageUrl = useCallback((product) => {
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      return `${baseUrl}/${product.imageUrl.replace(/\\/g, '/')}`;
    }
    return product.image || '/pet images/collar.jpeg';
  }, []);

  const createOrder = useCallback(async () => {
    try {
      console.log('Creating order for product:', product);
      console.log('Order data will be:', {
        products: [{
          product: product._id,
          quantity: quantity
        }],
        totalAmount: totalAmount
      });

      const orderData = {
        products: [{
          product: product._id,
          quantity: quantity
        }],
        totalAmount: totalAmount
      };

      const response = await api.post('/orders', orderData);

      console.log('Order created successfully:', response.data);
      return response.data._id;
    } catch (err) {
      console.error('Order creation error:', err);
      console.error('Error response:', err.response?.data);
      throw new Error(err.response?.data?.message || 'Failed to create order. Please try again.');
    }
  }, [product, quantity, totalAmount, user.token]);

  const handlePayPalApprove = useCallback(async (orderData) => {
    setPaymentProcessing(true);
    setError('');

    try {
      console.log('PayPal order approved:', orderData);

      const localOrderId = await createOrder();

      const response = await api.put(`/orders/${localOrderId}/payment`, {
        paypalOrderId: orderData.orderID,
        status: 'COMPLETED'
      });

      console.log('Payment status updated:', response.data);
      
      // Clear the stored product data
      localStorage.removeItem('buyNowProduct');
      
      setTimeout(() => {
        navigate(`/payment-success?orderId=${localOrderId}&paypalOrderId=${orderData.orderID}&amount=${totalAmount}`, { replace: true });
      }, 100);

    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Payment processing failed';
      setTimeout(() => {
        navigate(`/payment-failed?error=backend_error&reason=${encodeURIComponent(errorMessage)}&amount=${totalAmount}`, { replace: true });
      }, 100);
    } finally {
      setPaymentProcessing(false);
    }
  }, [createOrder, totalAmount, user.token, navigate]);

  const handlePayPalError = useCallback((err) => {
    console.error('PayPal error:', err);
    setError('PayPal error occurred. Please try again.');
    setPaymentProcessing(false);
    
    navigate(`/payment-failed?error=paypal_error&reason=${encodeURIComponent(err.message || 'Unknown PayPal error')}`);
  }, [navigate]);

  const handlePayPalCancel = useCallback(() => {
    setError('Payment was cancelled.');
    setPaymentProcessing(false);
    
    navigate(`/payment-failed?error=payment_cancelled&reason=${encodeURIComponent('Payment was cancelled by user')}`);
  }, [navigate]);

  useEffect(() => {
    console.log('ProductCheckout loaded');
    console.log('User:', user);
    console.log('Product from state:', product);
    console.log('Location state:', location.state);

    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login');
      return;
    }

    if (!product) {
      console.log('No product found, redirecting to products');
      navigate('/products');
      return;
    }

    console.log('ProductCheckout initialized successfully');
  }, [user, product, navigate, location.state]);

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please <a href="/login">login</a> to proceed with checkout.
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          Product not found. <a href="/products">Browse products</a>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Quick Checkout</h2>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Product Details</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center">
                <img
                  src={getImageUrl(product)}
                  alt={product.name}
                  className="me-3"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/pet images/collar.jpeg';
                  }}
                />
                <div className="flex-grow-1">
                  <h5 className="mb-2">{product.name}</h5>
                  <p className="text-muted mb-2">{product.description}</p>
                  <div className="d-flex align-items-center mb-2">
                    <label className="me-2">Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="form-control"
                      style={{ width: '80px' }}
                    />
                  </div>
                </div>
                <div className="text-end">
                  <div className="mb-1">₹{product.price} each</div>
                  <strong>₹{totalAmount}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h4>Payment</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span>₹{totalAmount}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong>
                  <strong>₹{totalAmount}</strong>
                </div>
              </div>

              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" />
                  <p className="mt-2">Processing...</p>
                </div>
              ) : paymentProcessing ? (
                <div className="text-center">
                  <Spinner animation="border" />
                  <p className="mt-2">Processing payment...</p>
                </div>
              ) : (
                <div>
                  <p className="mb-3">Complete your payment with PayPal:</p>
                  <ErrorBoundary>
                    <PayPalButton
                      amount={totalAmount}
                      onApprove={handlePayPalApprove}
                      onError={handlePayPalError}
                      onCancel={handlePayPalCancel}
                    />
                  </ErrorBoundary>
                  <div className="mt-3">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => navigate(-1)}
                      className="w-100"
                    >
                      Back to Product
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductCheckout;
