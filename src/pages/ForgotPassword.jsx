// pages/ForgotPassword.jsx
import { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      setTimeout(() => navigate('/verify-otp', { state: { email } }), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred!');
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4">📄 Forgot Password</h3>
      {success && <Alert variant="success">Reset instructions sent to your email.</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Enter your registered email</Form.Label>
          <Form.Control type="email" required placeholder="example@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">Send Reset Link</Button>
      </Form>
    </Container>
  );
}

export default ForgotPassword;
