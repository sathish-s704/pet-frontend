import { useEffect, useState } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircleFill } from 'react-bootstrap-icons';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get error details from URL parameters
    const error = searchParams.get('error');
    const orderId = searchParams.get('orderId');
    const reason = searchParams.get('reason');

    if (error || orderId || reason) {
      setErrorDetails({
        error,
        orderId,
        reason: reason || 'Payment processing failed',
        timestamp: new Date().toISOString()
      });
    }
    
    setLoading(false);

    // Auto redirect after 15 seconds
    const timer = setTimeout(() => {
      navigate('/checkout');
    }, 15000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-3">Processing payment status...</p>
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
                <XCircleFill 
                  size={80} 
                  className="text-danger mb-3" 
                />
                <h2 className="text-danger mb-3">Payment Failed!</h2>
                <p className="text-muted">
                  Unfortunately, your payment could not be processed. Please try again.
                </p>
              </div>

              {errorDetails && (
                <Alert variant="danger" className="mb-4">
                  <div className="row text-start">
                    {errorDetails.orderId && (
                      <div className="col-12 mb-2">
                        <strong>Order ID:</strong> #{errorDetails.orderId.slice(-8)}
                      </div>
                    )}
                    <div className="col-12 mb-2">
                      <strong>Error:</strong> {errorDetails.reason}
                    </div>
                    <div className="col-12">
                      <strong>Time:</strong> {new Date(errorDetails.timestamp).toLocaleString()}
                    </div>
                  </div>
                </Alert>
              )}

              <div className="mb-4">
                <h6 className="text-muted mb-3">What happened?</h6>
                <ul className="text-start text-muted small">
                  <li>Your payment was not processed</li>
                  <li>No charges were made to your account</li>
                  <li>Your cart items are still saved</li>
                  <li>You can try payment again</li>
                </ul>
              </div>

              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                >
                  Try Payment Again
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate('/cart')}
                >
                  Review Cart
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </Button>
              </div>

              <p className="text-muted mt-3 small">
                You will be automatically redirected to checkout in a few seconds.
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default PaymentFailed;
