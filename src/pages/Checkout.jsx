import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import PayPalButton from '../components/PayPalButton';
import ErrorBoundary from '../components/ErrorBoundary';

const Checkout = () => {
  const { cartItems = [], dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const isBuyNow = searchParams.get('buyNow') === 'true';
  const totalAmount = cartItems?.reduce((acc, item) => acc + (item?.price || 0) * (item?.quantity || 0), 0) || 0;

  const getImageUrl = useCallback((product) => {
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      return `http://localhost:3000/${product.imageUrl.replace(/\\/g, '/')}`;
    }
    return product.image || '/pet images/collar.jpeg';
  }, []);

  const createOrder = useCallback(async () => {
    try {
      console.log('=== Creating Order ===');
      console.log('Cart items for order:', cartItems);
      console.log('User token:', user?.token ? 'Present' : 'Missing');
      console.log('Total amount:', totalAmount);
      
      if (!cartItems || cartItems.length === 0) {
        throw new Error('No items in cart');
      }
      
      if (!user?.token) {
        throw new Error('User not authenticated');
      }

      // Validate stock before creating order
      for (const item of cartItems) {
        if (!item.inStock || item.totalStock === 0) {
          throw new Error(`${item.name} is currently out of stock`);
        }
        if (item.quantity > item.totalStock) {
          throw new Error(`Only ${item.totalStock} items available for ${item.name}, but ${item.quantity} requested`);
        }
      }
      
      const orderData = {
        products: cartItems.map(item => {
          console.log('Processing cart item:', item);
          if (!item._id) {
            throw new Error('Invalid cart item - missing ID');
          }
          return {
            product: item._id,
            quantity: item.quantity || 1
          };
        }),
        totalAmount: totalAmount
      };

      console.log('Order data to send:', orderData);

      const response = await api.post('/orders', orderData);

      console.log('Order creation response:', response.data);
      return response.data._id;
    } catch (err) {
      console.error('=== Order Creation Error ===');
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      throw new Error(err.message || 'Failed to create order. Please try again.');
    }
  }, [cartItems, totalAmount, user?.token]);

  const handlePayPalApprove = useCallback(async (orderData) => {
    console.log('=== PayPal Approve Handler Start ===');
    console.log('PayPal orderData:', orderData);
    console.log('User token:', user?.token ? 'Present' : 'Missing');
    console.log('Cart items:', cartItems);
    console.log('Total amount:', totalAmount);
    
    setPaymentProcessing(true);
    setError('');

    try {
      console.log('Step 1: Creating order...');

      const localOrderId = await createOrder();
      console.log('Step 2: Order created successfully with ID:', localOrderId);

      console.log('Step 3: Updating payment status...');
      const response = await api.put(`/orders/${localOrderId}/payment`, {
        paypalOrderId: orderData.orderID,
        status: 'COMPLETED'
      });

      console.log('Step 4: Payment status updated successfully:', response.data);

      console.log('Step 5: Clearing cart...');
      dispatch({ type: 'CLEAR_CART' });
      
      console.log('Step 6: Navigating to success page...');
      setTimeout(() => {
        navigate(`/payment-success?orderId=${localOrderId}&paypalOrderId=${orderData.orderID}&amount=${totalAmount}`, { replace: true });
      }, 100);

    } catch (err) {
      console.error('=== PayPal Approve Handler Error ===');
      console.error('Full error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Payment processing failed';
      console.log('Navigating to payment failed with error:', errorMessage);
      
      setTimeout(() => {
        navigate(`/payment-failed?error=backend_error&reason=${encodeURIComponent(errorMessage)}&amount=${totalAmount}`, { replace: true });
      }, 100);
    } finally {
      setPaymentProcessing(false);
      console.log('=== PayPal Approve Handler End ===');
    }
  }, [createOrder, totalAmount, user?.token, dispatch, navigate]);

  const handlePayPalError = useCallback((err) => {
    console.error('PayPal error:', err);
    setError('PayPal error occurred. Please try again.');
    setPaymentProcessing(false);
    
    // Navigate to payment failed page with error details
    navigate(`/payment-failed?error=paypal_error&reason=${encodeURIComponent(err.message || 'Unknown PayPal error')}`);
  }, [navigate]);

  const handlePayPalCancel = useCallback(() => {
    setError('Payment was cancelled.');
    setPaymentProcessing(false);
    
    // Navigate to payment failed page with cancellation details
    navigate(`/payment-failed?error=payment_cancelled&reason=${encodeURIComponent('Payment was cancelled by user')}`);
  }, [navigate]);

  const initializeCheckout = useCallback(async () => {
    console.log('=== Initializing Checkout ===');
    console.log('User:', user);
    console.log('Cart items:', cartItems);
    console.log('Is Buy Now:', isBuyNow);
    
    setLoading(true);
    
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (!user.token) {
      console.log('User has no token, redirecting to login');
      navigate('/login');
      return;
    }

    // Special handling for page refresh - check localStorage directly
    if (!cartItems || cartItems.length === 0) {
      console.log('Cart appears empty, checking localStorage directly...');
      
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('Found cart in localStorage:', parsedCart);
          
          if (parsedCart && parsedCart.length > 0) {
            console.log('Cart exists in localStorage, waiting for context to update...');
            // Wait a bit for the context to catch up
            setTimeout(() => {
              setLoading(false);
              setOrderId('ready');
            }, 200);
            return;
          }
        }
      } catch (error) {
        console.error('Error reading cart from localStorage:', error);
      }
      
      // If we reach here, cart is truly empty
      if (isBuyNow) {
        console.log('Buy Now session expired - cart is empty');
        setError('Buy Now session expired. Please try again.');
        setTimeout(() => navigate('/products'), 2000);
        return;
      } else {
        console.log('Cart is empty, redirecting to cart');
        navigate('/cart');
        return;
      }
    }

    console.log('Checkout initialization successful');
    setLoading(false);
    setOrderId('ready'); // Set to ready state instead of creating order upfront
  }, [user, cartItems, navigate, isBuyNow]);

  useEffect(() => {
    initializeCheckout();
  }, [initializeCheckout]);

  // Show loading spinner while checking authentication and cart
  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading checkout...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please <a href="/login">login</a> to proceed with checkout.
        </Alert>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          Your cart is empty. <a href="/products">Continue shopping</a>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isBuyNow ? 'Quick Checkout' : 'Checkout'}</h2>
        {isBuyNow && (
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate(-1)}
          >
            Back to Product
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {isBuyNow && (
        <Alert variant="info" className="mb-4">
          <strong>Quick Purchase:</strong> You're buying this item directly. Your cart has been cleared for this purchase.
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4>{isBuyNow ? 'Product Details' : 'Order Summary'}</h4>
            </Card.Header>
            <Card.Body>
              {cartItems && cartItems.length > 0 ? cartItems.map((item, index) => (
                <div key={item?._id || index} className="d-flex align-items-center mb-3">
                  <img
                    src={getImageUrl(item)}
                    alt={item?.name || 'Product'}
                    className="me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/pet images/collar.jpeg';
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{item?.name || 'Unknown Product'}</h6>
                    <small className="text-muted">Quantity: {item?.quantity || 1}</small>
                  </div>
                  <div className="text-end">
                    <strong>₹{(item?.price || 0) * (item?.quantity || 1)}</strong>
                  </div>
                </div>
              )) : (
                <div className="text-center">
                  <p>No items in cart</p>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <h5>Total:</h5>
                <h5>₹{totalAmount}</h5>
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
              ) : orderId ? (
                <div>
                  <p className="mb-3">Complete your payment:</p>
                  
                  {/* PayPal Payment Option */}
                  <div className="mb-3">
                    <h6>PayPal Payment</h6>
                    <ErrorBoundary>
                      <PayPalButton
                        amount={totalAmount}
                        onApprove={handlePayPalApprove}
                        onError={handlePayPalError}
                        onCancel={handlePayPalCancel}
                      />
                    </ErrorBoundary>
                  </div>
                </div>
              ) : (
                <p>Initializing payment...</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
