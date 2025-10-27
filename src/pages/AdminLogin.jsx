import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password }); // ✅ match backend route
      const user = res.data.user;

      if (user.role !== 'admin') {
        alert('Access denied. You are not an admin.');
        return;
      }
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      alert('Admin login successful');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Admin login failed", err);
      alert(err.response?.data?.message || 'Admin login failed!');
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4">👨‍💼 Admin Login</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </Form.Group>
        <Button variant="dark" type="submit">Login</Button>
      </Form>
    </Container>
  );
}

export default AdminLogin;

