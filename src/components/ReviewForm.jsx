import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Star, StarFill } from 'react-bootstrap-icons';

const ReviewForm = ({ show, onHide, onSubmit, review = null, productName }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (review) {
      setFormData({
        rating: review.rating,
        title: review.title,
        comment: review.comment
      });
    } else {
      setFormData({
        rating: 5,
        title: '',
        comment: ''
      });
    }
    setError('');
  }, [review, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please provide a review title');
      return;
    }
    
    if (!formData.comment.trim()) {
      setError('Please provide a review comment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      setFormData({ rating: 5, title: '', comment: '' });
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isHovered = hoverRating >= starValue;
      const isSelected = formData.rating >= starValue;
      
      return (
        <span
          key={index}
          style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setFormData({ ...formData, rating: starValue })}
        >
          {isHovered || isSelected ? (
            <StarFill className="text-warning me-1" />
          ) : (
            <Star className="text-muted me-1" />
          )}
        </span>
      );
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {review ? 'Edit Review' : 'Write a Review'}
          {productName && <small className="text-muted d-block">{productName}</small>}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Rating *</Form.Label>
            <div className="d-flex align-items-center">
              {renderStars()}
              <span className="ms-2 text-muted">
                ({formData.rating} star{formData.rating !== 1 ? 's' : ''})
              </span>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Review Title *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Summarize your experience"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={100}
              required
            />
            <Form.Text className="text-muted">
              {formData.title.length}/100 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Review Comment *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Tell others about your experience with this product"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              maxLength={1000}
              required
            />
            <Form.Text className="text-muted">
              {formData.comment.length}/1000 characters
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : (review ? 'Update Review' : 'Submit Review')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReviewForm;
