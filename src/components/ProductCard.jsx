import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  HeartFill, 
  Cart3, 
  Lightning, 
  Star, 
  StarFill 
} from 'react-bootstrap-icons';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { dispatch } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const { user } = useAuth();

  const addToCart = () => {
    if (!product.inStock || product.totalStock === 0) {
      alert(`${product.name} is currently out of stock`);
      return;
    }
    dispatch({ type: 'ADD_TO_CART', payload: product });
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
    
    console.log('Buy Now clicked for product:', product);
    
    // Clear cart first
    dispatch({ type: 'CLEAR_CART' });
    
    // Add only this product to cart
    dispatch({ type: 'ADD_TO_CART', payload: product });
    
    // Navigate directly to checkout with a buy-now flag
    navigate('/checkout?buyNow=true');
  };

  const viewProduct = () => {
    navigate(`/product/${product._id}`);
  };

  const toggleWishlist = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  // Construct the proper image URL
  const getImageUrl = () => {
    if (product.imageUrl) {
      // If imageUrl is a full path, use it directly
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      // Otherwise, construct the URL from the backend uploads directory
      return `http://localhost:3000/${product.imageUrl.replace(/\\/g, '/')}`;
    }
    // Fallback to a default image or the image property if it exists
    return product.image || '/pet images/collar.jpeg';
  };

  // Generate star rating display
  const renderStars = () => {
    const rating = Math.round(product.averageRating || 0);
    const reviewCount = product.reviewCount || 0;
    
    return (
      <div className="d-flex align-items-center">
        {[...Array(5)].map((_, i) => (
          i < rating ? (
            <StarFill 
              key={i} 
              className="text-warning me-1" 
              style={{ fontSize: '0.9rem' }}
            />
          ) : (
            <Star 
              key={i} 
              className="text-muted me-1" 
              style={{ fontSize: '0.9rem' }}
            />
          )
        ))}
        <small className="text-muted ms-1">
          ({product.averageRating ? product.averageRating.toFixed(1) : '0.0'}) · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
        </small>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="card-modern border-0 p-3 mb-3" data-aos="fade-up">
        <div className="row g-0 align-items-center">
          <div className="col-md-3 position-relative">
            <div className="product-image-list">
              <img 
                src={getImageUrl()} 
                alt={product.name} 
                className="img-fluid"
                style={{ 
                  height: '120px', 
                  objectFit: 'cover', 
                  width: '100%',
                  borderRadius: 'var(--border-radius-lg)'
                }}
                onError={(e) => {
                  e.target.src = '/pet images/collar.jpeg';
                }}
              />
              <button
                onClick={toggleWishlist}
                className="wishlist-btn position-absolute"
                style={{ 
                  top: '8px',
                  right: '8px',
                  background: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isInWishlist(product._id) ? (
                  <HeartFill className="text-danger" />
                ) : (
                  <Heart className="text-muted" />
                )}
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card-body p-3">
              <h5 className="fw-bold mb-2 product-title">{product.name}</h5>
              {product.description && (
                <p className="text-muted mb-2 product-description">
                  {product.description}
                </p>
              )}
              <div className="d-flex align-items-center mb-2">
                <span className="price-current me-3">
                  ₹{product.price}
                </span>
                <span className={`badge ${product.inStock ? 'bg-success' : 'bg-danger'}`}>
                  {product.inStock ? `In Stock (${product.totalStock || 0})` : 'Out of Stock'}
                </span>
              </div>
              {renderStars()}
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3">
              <div className="d-grid gap-2">
                <button
                  onClick={addToCart}
                  disabled={!product.inStock}
                  className={`btn ${
                    product.inStock ? 'btn-modern-outline' : 'btn-secondary'
                  }`}
                  style={{ fontSize: '0.9rem' }}
                >
                  <Cart3 className="me-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                {product.inStock && (
                  <button
                    onClick={buyNow}
                    className="btn btn-modern-primary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    <Lightning className="me-2" />
                    Buy Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-card card-modern h-100 border-0 position-relative" data-aos="fade-up">
      <div className="product-image" onClick={viewProduct} style={{ cursor: 'pointer' }}>
        <img 
          src={getImageUrl()} 
          alt={product.name} 
          onError={(e) => {
            e.target.src = '/pet images/collar.jpeg';
          }}
        />
        
        {/* Product Badge */}
        {product.inStock && (
          <div className="product-badge">New</div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          className="wishlist-btn position-absolute"
          style={{ 
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.95)', 
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
        >
          {isInWishlist(product._id) ? (
            <HeartFill className="text-danger" />
          ) : (
            <Heart className="text-muted" />
          )}
        </button>
      </div>
      
      <div className="product-info">
        <h3 
          className="product-title" 
          onClick={viewProduct} 
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h3>
        
        {product.description && (
          <p className="product-description">
            {product.description}
          </p>
        )}
        
        <div className="product-price">
          <span className="price-current">₹{product.price}</span>
          {product.originalPrice && (
            <>
              <span className="price-original">₹{product.originalPrice}</span>
              <span className="price-discount">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          {renderStars()}
          <span className={`badge ${product.inStock ? 'bg-success' : 'bg-danger'}`}>
            {product.inStock ? `Stock: ${product.totalStock || 0}` : 'Out of Stock'}
          </span>
        </div>
        
        <div className="product-actions">
          <button
            onClick={addToCart}
            disabled={!product.inStock}
            className={`btn ${
              product.inStock ? 'btn-add-cart' : 'btn-secondary'
            }`}
          >
            <Cart3 className="me-1" style={{ fontSize: '1rem' }} />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          {product.inStock && (
            <button
              onClick={buyNow}
              className="btn btn-buy-now"
            >
              <Lightning className="me-1" style={{ fontSize: '1rem' }} />
              Buy Now
            </button>
          )}
        </div>
      </div>

      {/* Add custom styles for this component */}
      <style jsx>{`
        .wishlist-btn:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-md) !important;
        }
        
        .wishlist-btn:hover svg {
          color: var(--primary-color) !important;
        }
        
        .product-image-list {
          position: relative;
          overflow: hidden;
          border-radius: var(--border-radius-lg);
        }
        
        .product-image-list img {
          transition: transform 0.3s ease;
        }
        
        .product-image-list:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
