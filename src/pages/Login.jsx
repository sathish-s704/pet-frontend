import { useState } from 'react';
import { Form, Button, Container, InputGroup } from 'react-bootstrap';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth(); // ✅

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });

      const loggedInUser = {
        ...res.data.user,
        token: res.data.token || res.data.user?.token // in case token is separated
      };

      // Save to context and localStorage
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      alert(res.data.message || 'Login successful');
      
      // JWT-based role redirection
      if (loggedInUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed!');
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4 text-center">🔐 User Login</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Password</Form.Label>
          <InputGroup>
            <Form.Control
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
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
          Login
        </Button>
      </Form>

      <div className="mt-3 text-center">
        <small>
          Don't have an account?{' '}
          <Link to="/register" style={{ textDecoration: 'none', color: '#0d6efd' }}>
            Register
          </Link>
        </small>
        <br />
        <small>
          <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#0d6efd' }}>
            Forgot Password?
          </Link>
        </small>
      </div>
    </Container>
  );
}

export default Login;
