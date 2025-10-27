import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Pets, 
  FavoriteRounded, 
  LocalShipping, 
  VerifiedUser, 
  Star,
  ArrowForward,
  ShoppingCart,
  Visibility
} from '@mui/icons-material';
import api from '../utils/api';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products');
        setFeaturedProducts(response.data.slice(0, 6)); // Get first 6 products
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const getImageUrl = (product) => {
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      return `${baseUrl}/${product.imageUrl.replace(/\\/g, '/')}`;
    }
    return product.image || '/pet images/collar.jpeg';
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={6} className="text-white" data-aos="fade-right">
              <div className="hero-content">
                <h1 className="hero-title">
                  Everything Your Pet 
                  <span className="d-block text-gradient-secondary">Needs & Loves! 🐾</span>
                </h1>
                <p className="hero-subtitle">
                  Discover premium pet accessories, toys, and essentials that bring joy to your furry friends. 
                  Quality products crafted with love and care for every pet's unique needs.
                </p>
                <div className="hero-cta d-flex gap-3 flex-wrap">
                  <Button 
                    as={Link} 
                    to="/products" 
                    size="lg"
                    className="btn-modern-ghost"
                  >
                    <ShoppingCart className="me-2" />
                    Shop Now
                  </Button>
                  <Button 
                    as={Link} 
                    to="/contact" 
                    variant="outline-light" 
                    size="lg"
                    className="btn-modern-outline border-white text-white"
                  >
                    <Visibility className="me-2" />
                    Learn More
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6} className="text-center" data-aos="fade-left">
              <div className="hero-image">
                <div className="position-relative">
                  <div 
                    className="hero-circle"
                    style={{
                      width: '400px',
                      height: '400px',
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '50%',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8rem',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <span className="hero-emoji">🐕🐈</span>
                    <div 
                      className="hero-circle-bg"
                      style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.1) 90deg, transparent 180deg)',
                        animation: 'rotate 20s linear infinite'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <Container>
          <div className="section-header" data-aos="fade-up">
            <h2 className="section-title">Why Choose PetStore?</h2>
            <p className="section-subtitle">We're dedicated to providing the best for your beloved pets with premium quality and exceptional service</p>
          </div>
          <Row className="feature-cards">
            {[
              {
                icon: <FavoriteRounded />,
                title: 'Made with Love',
                description: 'Every product is carefully selected with your pet\'s happiness and well-being in mind',
                color: 'var(--primary-color)'
              },
              {
                icon: <LocalShipping />,
                title: 'Fast Delivery',
                description: 'Quick and safe delivery to your doorstep, because your pets can\'t wait for their new favorites',
                color: 'var(--secondary-color)'
              },
              {
                icon: <VerifiedUser />,
                title: 'Quality Assured',
                description: 'Premium quality products that are safe, durable, and perfect for all types of pets',
                color: 'var(--success-color)'
              },
              {
                icon: <Pets />,
                title: 'Pet Approved',
                description: 'Tested and loved by thousands of happy pets and their satisfied owners worldwide',
                color: 'var(--accent-color)'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="feature-card" 
                data-aos="fade-up" 
                data-aos-delay={index * 100}
              >
                <div 
                  className="feature-icon"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-5" style={{ backgroundColor: 'var(--gray-50)' }}>
        <Container>
          <div className="section-header" data-aos="fade-up">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Our most popular items that pets absolutely love and owners trust!</p>
          </div>
          
          {loading ? (
            <div className="text-center" data-aos="fade-up">
              <div className="loading-skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto' }}></div>
              <p className="mt-3 text-muted">Loading amazing products...</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {featuredProducts.map((product, index) => (
                  <div 
                    key={index}
                    className="product-card card-modern"
                    data-aos="fade-up" 
                    data-aos-delay={index * 100}
                  >
                    <div className="product-image">
                      <img 
                        src={getImageUrl(product)}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/pet images/collar.jpeg';
                        }}
                      />
                      {product.inStock && (
                        <div className="product-badge">New</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.name}</h3>
                      {product.description && (
                        <p className="product-description">{product.description}</p>
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
                        <div className="d-flex align-items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              style={{ 
                                color: i < 4 ? 'var(--accent-color)' : 'var(--gray-300)',
                                fontSize: '1rem'
                              }} 
                            />
                          ))}
                          <small className="text-muted ms-1">(4.0)</small>
                        </div>
                        <span className={`badge ${product.inStock ? 'bg-success' : 'bg-danger'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <div className="product-actions">
                        <Button 
                          className="btn-add-cart"
                          disabled={!product.inStock}
                        >
                          <ShoppingCart className="me-1" style={{ fontSize: '1rem' }} />
                          Add to Cart
                        </Button>
                        <Button 
                          className="btn-buy-now"
                          disabled={!product.inStock}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-5" data-aos="fade-up">
                <Button 
                  as={Link} 
                  to="/products" 
                  size="lg"
                  className="btn-modern-outline"
                >
                  View All Products <ArrowForward className="ms-2" />
                </Button>
              </div>
            </>
          )}
        </Container>
      </section>

      {/* Newsletter Section */}
      <section 
        className="py-5" 
        style={{ 
          background: 'var(--gradient-secondary)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container className="position-relative">
          <Row className="text-center text-white">
            <Col lg={8} className="mx-auto" data-aos="fade-up">
              <h3 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
                Stay Updated on Pet Care Tips! 📧
              </h3>
              <p className="mb-4 fs-5">
                Get the latest pet care advice, product updates, and exclusive offers delivered straight to your inbox.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                  <input 
                    type="email" 
                    className="form-control-modern" 
                    placeholder="Enter your email address"
                    style={{ 
                      padding: '1rem 1.5rem',
                      fontSize: '1rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      borderRadius: 'var(--border-radius)'
                    }}
                  />
                </div>
                <Button className="btn-modern-ghost border-white" size="lg">
                  Subscribe Now
                </Button>
              </div>
              <p className="mt-3 small opacity-75">
                Join 10,000+ pet owners who trust us for the best pet care advice
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .hero-emoji {
          position: relative;
          z-index: 2;
        }
        
        .min-vh-75 {
          min-height: 75vh;
        }
        
        .text-gradient-secondary {
          background: var(--gradient-secondary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}

export default Home;
