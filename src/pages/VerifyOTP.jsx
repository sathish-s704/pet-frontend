import { useState, useRef } from 'react';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function VerifyOTP() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const handleChange = (element, index) => {
    if (!isNaN(element.value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = element.value;
      setOtp(updatedOtp);

      // Move to next box
      if (element.value && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const joinedOtp = otp.join('');
    try {
      await api.post('/auth/verify-otp', { email, otp: joinedOtp });
      setSuccess(true);
      setTimeout(() => navigate('/reset-password', { state: { email, otp: joinedOtp } }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP!');
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4 text-center text-primary">🔐 Verify OTP</h3>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">✅ OTP verified! Redirecting...</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-4 justify-content-center">
          {otp.map((digit, index) => (
            <Col xs={2} key={index}>
              <Form.Control
                type="text"
                value={digit}
                maxLength={1}
                className="text-center fw-bold fs-4 border-primary"
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
              />
            </Col>
          ))}
        </Row>

        <div className="text-center">
          <Button type="submit" variant="success">Verify OTP</Button>
        </div>
      </Form>
    </Container>
  );
}

export default VerifyOTP;

