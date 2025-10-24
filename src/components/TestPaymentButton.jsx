import React, { useState } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';

const TestPaymentButton = ({ amount, onApprove, onError, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleTestPayment = async (success = true) => {
    try {
      setProcessing(true);
      console.log('=== Test Payment Started ===');
      console.log('Amount:', amount);
      console.log('Simulating success:', success);
      
      // Add realistic delay to simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (success) {
        // Simulate PayPal response
        const mockPayPalResponse = {
          orderID: `TEST_ORDER_${Date.now()}`,
          payerID: 'TEST_PAYER_123',
          facilitatorAccessToken: 'TEST_TOKEN'
        };
        
        console.log('Simulating successful payment with data:', mockPayPalResponse);
        
        // Call the success handler
        if (onApprove) {
          await onApprove(mockPayPalResponse);
        }
      } else {
        // Simulate payment failure
        const error = new Error('Test payment failed - insufficient funds');
        console.log('Simulating payment failure');
        if (onError) {
          onError(error);
        }
      }
    } catch (error) {
      console.error('Test payment error:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setProcessing(false);
      setShowOptions(false);
    }
  };

  const handleTestCancel = () => {
    console.log('Test payment cancelled');
    setShowOptions(false);
    if (onCancel) {
      onCancel();
    }
  };

  if (processing) {
    return (
      <div className="border p-3 rounded bg-light text-center">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Processing payment...</span>
      </div>
    );
  }

  return (
    <div className="border p-3 rounded bg-light">
      <h6 className="text-center mb-3">Test Payment System</h6>
      <p className="text-center text-muted small">
        Amount: ₹{amount} (${(amount / 80).toFixed(2)} USD equivalent)
      </p>
      
      {!showOptions ? (
        <div className="d-grid">
          <Button 
            variant="warning" 
            onClick={() => setShowOptions(true)}
            className="fw-bold"
          >
            🧪 Use Test Payment
          </Button>
        </div>
      ) : (
        <div>
          <Alert variant="info" className="small">
            Choose a test scenario:
          </Alert>
          <div className="d-grid gap-2">
            <Button 
              variant="success" 
              onClick={() => handleTestPayment(true)}
              className="fw-bold"
            >
              ✅ Simulate Successful Payment
            </Button>
            <Button 
              variant="danger" 
              onClick={() => handleTestPayment(false)}
            >
              ❌ Simulate Failed Payment
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleTestCancel}
            >
              Cancel Payment
            </Button>
          </div>
        </div>
      )}
      
      <small className="text-muted d-block text-center mt-2">
        This is a test payment system for development
      </small>
    </div>
  );
};

export default TestPaymentButton;
