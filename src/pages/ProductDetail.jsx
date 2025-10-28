import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import { Cart3, Lightning, Heart, HeartFill, Star, StarFill, ArrowLeft } from 'react-bootstrap-icons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductReviews from '../components/ProductReviews';
import api from '../utils/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dispatch } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      setError('');
    } catch (err) {
      setError('Product not found');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (product) => {
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      return `${baseUrl}/${product.imageUrl.replace(/\\/g, '/')}`;
    }
    return '/pet images/collar.jpeg';
  };

  const addToCart = () => {
    if (!product.inStock || product.totalStock === 0) {
      alert(`${product.name} is currently out of stock`);
      return;
    }
    dispatch({ type: 'ADD_TO_CART', payload: product });
    alert('Product added to cart!');
  };

  const buyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product.inStock || product.totalStock === 0) {
      alert(`${product.name} is currently out of stock`);
      return;
    }
    
    dispatch({ type: 'CLEAR_CART' });
    dispatch({ type: 'ADD_TO_CART', payload: product });
    navigate('/checkout?buyNow=true');
  };

  const toggleWishlist = () => {
    if (!user) {
      alert('Please login to add items to wishlist');
      return;
    }

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
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

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading product details...</p>
        </div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Product Not Found</h4>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Button variant="outline-primary" onClick={() => navigate('/products')}>
            <ArrowLeft className="me-1" />
            Back to Products
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Back Button */}
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate('/products')}
        className="mb-4"
      >
        <ArrowLeft className="me-1" />
        Back to Products
      </Button>

      <Row>
        {/* Product Image */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <img
                src={getImageUrl(product)}
                alt={product.name}
                className="w-100"
                style={{ 
                  height: '400px', 
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  e.target.src = '/pet images/collar.jpeg';
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Product Details */}
        <Col lg={6}>
          <div className="h-100 d-flex flex-column">
            {/* Product Header */}
            <div className="mb-3">
              <h1 className="mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="d-flex align-items-center mb-2">
                {renderStars(Math.round(product.averageRating || 0))}
                <span className="ms-2 text-muted">
                  {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} 
                  ({product.reviewCount || 0} review{product.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Category */}
              <Badge bg="secondary" className="mb-3">{product.category}</Badge>
            </div>

            {/* Price */}
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <h2 className="text-primary mb-0 me-3">₹{product.price}</h2>
                {product.actualPrice && product.actualPrice > product.price && (
                  <>
                    <span className="text-muted text-decoration-line-through me-2">
                      ₹{product.actualPrice}
                    </span>
                    <Badge bg="danger">
                      {Math.round(((product.actualPrice - product.price) / product.actualPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-3">
              <Badge 
                bg={product.inStock ? 'success' : 'danger'}
                className="p-2"
              >
                {product.inStock 
                  ? `In Stock (${product.totalStock} available)` 
                  : 'Out of Stock'
                }
              </Badge>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-4">
                <h5>Description</h5>
                <p className="text-muted">{product.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto">
              <Row className="g-2">
                <Col>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="w-100"
                    onClick={addToCart}
                    disabled={!product.inStock}
                  >
                    <Cart3 className="me-2" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </Col>
                {product.inStock && (
                  <Col>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100"
                      onClick={buyNow}
                    >
                      <Lightning className="me-2" />
                      Buy Now
                    </Button>
                  </Col>
                )}
                <Col xs="auto">
                  <Button
                    variant="outline-danger"
                    size="lg"
                    onClick={toggleWishlist}
                    className="px-3"
                  >
                    {user && isInWishlist(product._id) ? (
                      <HeartFill />
                    ) : (
                      <Heart />
                    )}
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      {/* Product Reviews Section */}
      <ProductReviews
        productId={product._id}
        productName={product.name}
        averageRating={product.averageRating}
        reviewCount={product.reviewCount}
        ratingDistribution={product.ratingDistribution}
      />
    </Container>
  );
};

export default ProductDetail;

