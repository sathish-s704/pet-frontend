import { useState } from 'react';
import { Form, Button, Container, InputGroup } from 'react-bootstrap';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', {
        ...form
      });
      alert(res.data.message || 'Registration successful!');
      setForm({ name: '', email: '', password: '' });
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed!');
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4 text-center">📝 Create Your Account</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@domain.com"
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <Form.Control
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Choose a strong password"
              required
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? '🙈' : '👁️'}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Register
        </Button>
      </Form>

      <div className="mt-3 text-center">
        <small>
          Already have an account?{' '}
          <Link to="/login" style={{ textDecoration: 'none', color: '#0d6efd' }}>
            Login
          </Link>
        </small>
      </div>
    </Container>
  );
}

export default Register;


