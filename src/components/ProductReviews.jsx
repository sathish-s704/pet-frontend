import { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { Star, StarFill, Plus } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import axios from 'axios';

const ProductReviews = ({ productId, productName, averageRating, reviewCount, ratingDistribution }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, currentPage]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/reviews/product/${productId}?page=${currentPage}&sortBy=${sortBy}`
      );
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Error loading reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      if (editingReview) {
        await axios.put(
          `/api/reviews/${editingReview._id}`,
          reviewData,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );
      } else {
        await axios.post(
          `/api/reviews/product/${productId}`,
          reviewData,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );
      }
      
      fetchReviews();
      setEditingReview(null);
    } catch (error) {
      throw error;
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      index < rating ? (
        <StarFill key={index} className="text-warning me-1" />
      ) : (
        <Star key={index} className="text-muted me-1" />
      )
    ));
  };

  const renderRatingDistribution = () => {
    if (!ratingDistribution) return null;

    const total = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);

    return (
      <div className="mb-4">
        <h6>Rating Distribution</h6>
        {[5, 4, 3, 2, 1].map(rating => {
          const count = ratingDistribution[rating] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={rating} className="d-flex align-items-center mb-1">
              <span className="me-2" style={{ minWidth: '60px' }}>
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
              <ProgressBar 
                now={percentage} 
                className="flex-grow-1 me-2" 
                style={{ height: '8px' }}
              />
              <span className="text-muted" style={{ minWidth: '40px' }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-5">
      <Card>
        <Card.Header>
          <h4>Customer Reviews</h4>
        </Card.Header>
        <Card.Body>
          {/* Review Summary */}
          <Row className="mb-4">
            <Col md={6}>
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <h2 className="mb-0">{averageRating || 0}</h2>
                  <div>{renderStars(Math.round(averageRating || 0))}</div>
                  <small className="text-muted">
                    Based on {reviewCount || 0} review{reviewCount !== 1 ? 's' : ''}
                  </small>
                </div>
              </div>
              
              {user && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingReview(null);
                    setShowForm(true);
                  }}
                  className="d-flex align-items-center"
                >
                  <Plus className="me-1" />
                  Write a Review
                </Button>
              )}
            </Col>
            
            <Col md={6}>
              {renderRatingDistribution()}
            </Col>
          </Row>

          {/* Sort Options */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sort by:</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="createdAt">Most Recent</option>
                  <option value="rating">Highest Rating</option>
                  <option value="helpfulCount">Most Helpful</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading reviews...</p>
            </div>
          )}

          {/* Reviews List */}
          {!loading && reviews.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No reviews yet. Be the first to review this product!</p>
            </div>
          )}

          {!loading && reviews.length > 0 && (
            <>
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onUpdate={handleEditReview}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Button
                    variant="outline-primary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="me-2"
                  >
                    Previous
                  </Button>
                  <span className="align-self-center mx-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline-primary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Review Form Modal */}
      <ReviewForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setEditingReview(null);
        }}
        onSubmit={handleSubmitReview}
        review={editingReview}
        productName={productName}
      />
    </div>
  );
};

export default ProductReviews;
