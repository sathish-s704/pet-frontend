import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';
import axios from 'axios';

const MyReviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyReviews();
  }, [user, currentPage]);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/reviews/my-reviews?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Error loading your reviews');
      console.error('Error fetching user reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Reviews</h2>
            <Button variant="outline-primary" onClick={() => navigate('/products')}>
              Browse Products to Review
            </Button>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading your reviews...</p>
            </div>
          )}

          {!loading && reviews.length === 0 && (
            <Card className="text-center py-5">
              <Card.Body>
                <h5>No Reviews Yet</h5>
                <p className="text-muted mb-4">
                  You haven't written any reviews yet. Start by purchasing and reviewing products!
                </p>
                <Button variant="primary" onClick={() => navigate('/products')}>
                  Browse Products
                </Button>
              </Card.Body>
            </Card>
          )}

          {!loading && reviews.length > 0 && (
            <>
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  showProduct={true}
                  onUpdate={() => {
                    // Navigate to product page where user can edit review
                    navigate(`/product/${review.product._id}`);
                  }}
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
        </Col>
      </Row>
    </Container>
  );
};

export default MyReviews;
