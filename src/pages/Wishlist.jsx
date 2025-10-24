import { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist, clearWishlist } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const { user } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const moveAllToCart = () => {
    if (!user) {
      setAlertMessage('Please login to add items to cart!');
      setShowAlert(true);
      return;
    }

    let addedCount = 0;
    wishlist.forEach(product => {
      if (product.inStock) {
        cartDispatch({ type: 'ADD_TO_CART', payload: product });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setAlertMessage(`${addedCount} in-stock items added to cart!`);
      setShowAlert(true);
    } else {
      setAlertMessage('No in-stock items to add to cart.');
      setShowAlert(true);
    }
  };

  const removeFromWishlist = (productId) => {
    // This will be handled by the ProductCard component
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please <a href="/login">login</a> to view your wishlist.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>❤️ My Wishlist</h2>
        {wishlist.length > 0 && (
          <div className="d-flex gap-2">
            <Button 
              onClick={moveAllToCart}
              variant="outline-success"
            >
              Move All to Cart
            </Button>
            <Button 
              onClick={clearWishlist}
              variant="outline-danger"
            >
              Clear Wishlist
            </Button>
          </div>
        )}
      </div>

      {showAlert && (
        <Alert 
          variant="info" 
          dismissible 
          onClose={() => setShowAlert(false)}
          className="mb-4"
        >
          {alertMessage}
        </Alert>
      )}

      {wishlist.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h4 className="text-muted mb-3">Your wishlist is empty</h4>
            <p className="text-muted mb-4">
              Start adding products to your wishlist by browsing our collection!
            </p>
            <Button href="/products" variant="primary">
              Browse Products
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-muted">
              {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>
          
          <Row>
            {wishlist.map((product) => (
              <Col key={product._id} lg={4} md={6} className="mb-4">
                <ProductCard product={product} viewMode="grid" />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default Wishlist; 