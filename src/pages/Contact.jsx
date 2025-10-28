import { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Email, LocationOn, Phone } from '@mui/icons-material';
import api from '../utils/api';

function Contact() {
  // State for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { name, email, message };

    try {
      const res = await api.post('/contact', data);
      alert('Message sent!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center">📬 Contact Us</h2>
      <Row>
        <Col md={6} className="mb-4">
          <h5>Send us a message</h5>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="message">
              <Form.Label>Your Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Col>

        <Col md={6}>
          <h5>Contact Information</h5>
          <p><LocationOn /> 123 Pet Street, Animal Town, India</p>
          <p><Phone /> +91 98765 43210</p>
          <p><Email /> support@petaccessories.com</p>

          <iframe
            title="Google Map"
            src="https://maps.google.com/maps?q=India&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </Col>
      </Row>
    </Container>
  );
}

export default Contact;


