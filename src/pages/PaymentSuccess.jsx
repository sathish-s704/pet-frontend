import { useEffect, useState } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleFill } from 'react-bootstrap-icons';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order details from URL parameters or localStorage
    const orderId = searchParams.get('orderId');
    const paypalOrderId = searchParams.get('paypalOrderId');
    const amount = searchParams.get('amount');

    console.log('PaymentSuccess page loaded with params:', { orderId, paypalOrderId, amount });

    if (orderId || paypalOrderId) {
      setOrderDetails({
        orderId,
        paypalOrderId,
        amount,
        timestamp: new Date().toISOString()
      });
    }
    
    setLoading(false);

    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/profile');
    }, 10000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Processing payment confirmation...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="text-center shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="mb-4">
                <CheckCircleFill 
                  size={80} 
                  className="text-success mb-3" 
                />
                <h2 className="text-success mb-3">Payment Successful!</h2>
                <p className="text-muted">
                  Thank you for your purchase. Your order has been placed successfully.
                </p>
              </div>

              {orderDetails && (
                <Alert variant="light" className="mb-4">
                  <div className="row text-start">
                    {orderDetails.orderId && (
                      <div className="col-12 mb-2">
                        <strong>Order ID:</strong> #{orderDetails.orderId.slice(-8)}
                      </div>
                    )}
                    {orderDetails.paypalOrderId && (
                      <div className="col-12 mb-2">
                        <strong>PayPal Transaction:</strong> {orderDetails.paypalOrderId}
                      </div>
                    )}
                    {orderDetails.amount && (
                      <div className="col-12 mb-2">
                        <strong>Amount Paid:</strong> ₹{orderDetails.amount}
                      </div>
                    )}
                    <div className="col-12">
                      <strong>Date:</strong> {new Date(orderDetails.timestamp).toLocaleString()}
                    </div>
                  </div>
                </Alert>
              )}

              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/profile')}
                >
                  View My Orders
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </Button>
              </div>

              <p className="text-muted mt-3 small">
                You will be automatically redirected to your profile in a few seconds.
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default PaymentSuccess;
