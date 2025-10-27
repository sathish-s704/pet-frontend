import { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Star, StarFill, HandThumbsUp, HandThumbsUpFill, Shield } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ReviewCard = ({ review, onUpdate, showProduct = false }) => {
  const { user } = useAuth();
  const [helpful, setHelpful] = useState(
    review.helpful?.some(h => h.user === user?._id) || false
  );
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [loading, setLoading] = useState(false);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      index < rating ? (
        <StarFill key={index} className="text-warning me-1" />
      ) : (
        <Star key={index} className="text-muted me-1" />
      )
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleHelpful = async () => {
    if (!user) {
      alert('Please login to mark reviews as helpful');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `/api/reviews/${review._id}/helpful`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      setHelpful(response.data.helpful);
      setHelpfulCount(response.data.helpfulCount);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      alert('Error updating helpful status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                {review.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <h6 className="mb-0 d-flex align-items-center">
                {review.user?.name || 'Anonymous'}
                {review.verified && (
                  <Badge bg="success" className="ms-2 d-flex align-items-center">
                    <Shield className="me-1" style={{ fontSize: '0.8rem' }} />
                    Verified Purchase
                  </Badge>
                )}
              </h6>
              <small className="text-muted">{formatDate(review.createdAt)}</small>
            </div>
          </div>
          <div className="text-end">
            <div className="mb-1">{renderStars(review.rating)}</div>
            <small className="text-muted">{review.rating}/5</small>
          </div>
        </div>

        {showProduct && review.product && (
          <div className="mb-2">
            <small className="text-muted">
              Product: <strong>{review.product.name}</strong>
            </small>
          </div>
        )}

        <h6 className="fw-bold mb-2">{review.title}</h6>
        <p className="mb-3">{review.comment}</p>

        <div className="d-flex justify-content-between align-items-center">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleHelpful}
            disabled={loading}
            className="d-flex align-items-center"
          >
            {helpful ? (
              <HandThumbsUpFill className="me-1" />
            ) : (
              <HandThumbsUp className="me-1" />
            )}
            Helpful ({helpfulCount})
          </Button>

          {user && user._id === review.user?._id && (
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                onClick={() => onUpdate && onUpdate(review)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReviewCard;
