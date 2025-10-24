import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

const CartPage = () => {
  const { cartItems, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Helper function to get image URL
  const getImageUrl = (product) => {
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      return `http://localhost:3000/${product.imageUrl.replace(/\\/g, '/')}`;
    }
    return product.image || '/pet images/collar.jpeg';
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <>
          <div className="mb-4">
            {cartItems.map((item, index) => (
              <div key={index} className="d-flex align-items-center justify-content-between border-bottom py-3">
                <div className="d-flex align-items-center">
                  <img 
                    src={getImageUrl(item)} 
                    alt={item.name} 
                    className="me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/pet images/collar.jpeg';
                    }}
                  />
                  <div>
                    <h6 className="mb-0">{item.name}</h6>
                    <p className="text-muted mb-0">₹{item.price} × {item.quantity}</p>
                    <small className="text-muted">
                      {item.totalStock > 0 ? (
                        <span className="text-success">Stock: {item.totalStock} available</span>
                      ) : (
                        <span className="text-danger">Out of stock</span>
                      )}
                    </small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline-secondary"
                    onClick={() => dispatch({ type: 'DECREMENT', payload: item._id })}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button 
                    size="sm" 
                    variant="outline-secondary"
                    onClick={() => dispatch({ type: 'INCREMENT', payload: item._id })}
                    disabled={item.quantity >= item.totalStock || !item.inStock}
                    title={item.quantity >= item.totalStock ? 'Stock limit reached' : ''}
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item._id })}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <h3>Total: ₹{totalAmount}</h3>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (!user) {
                  alert('Please login to proceed to checkout!');
                  return;
                }
                navigate('/checkout');
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default CartPage;
