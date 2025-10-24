import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card, 
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  FilterList, 
  GridView, 
  ViewList, 
  Sort,
  Search
} from '@mui/icons-material';
import ProductCard from '../components/ProductCard';

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  const location = useLocation();
  const categories = ['Food', 'Toys', 'Accessories', 'Health', 'Grooming'];

  // Get search query from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchFromUrl = urlParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [location]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
  let productsArr = Array.isArray(response.data) ? response.data : [];
  setProducts(productsArr);
  setFilteredProducts(productsArr);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    // Stock filter
    if (stockFilter === 'instock') {
      filtered = filtered.filter(product => product.inStock);
    } else if (stockFilter === 'outofstock') {
      filtered = filtered.filter(product => !product.inStock);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, stockFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setStockFilter('all');
    setSortBy('name');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
        <p className="mt-3 text-muted">Loading amazing products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="fade-in">
      {/* Header Section */}
      <section 
        className="py-5 text-center text-white"
        style={{ 
          background: 'var(--gradient-secondary)',
          marginTop: '-1px' // Remove gap from navbar
        }}
      >
        <Container>
          <h1 className="display-5 fw-bold mb-3">🛍️ Our Products</h1>
          <p className="lead">
            Discover premium pet accessories and essentials for your beloved companions
          </p>
        </Container>
      </section>

      <Container className="py-5">
        <Row>
          {/* Filters Sidebar */}
          <Col lg={3} className="mb-4">
            <Card className="card-pet sticky-top" style={{ top: '100px' }}>
              <Card.Header className="d-flex align-items-center">
                <FilterList className="me-2" />
                <h6 className="mb-0 fw-bold">Filters</h6>
              </Card.Header>
              <Card.Body>
                {/* Search */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Search Products</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '35px' }}
                    />
                    <Search 
                      className="position-absolute"
                      style={{ 
                        left: '10px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: 'var(--primary-color)',
                        fontSize: '1.2rem'
                      }}
                    />
                  </div>
                </Form.Group>

                {/* Category Filter */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Category</Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Price Range */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Price Range (₹)</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                {/* Stock Filter */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Availability</Form.Label>
                  <Form.Select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                  >
                    <option value="all">All Products</option>
                    <option value="instock">In Stock</option>
                    <option value="outofstock">Out of Stock</option>
                  </Form.Select>
                </Form.Group>

                {/* Clear Filters */}
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Products Section */}
          <Col lg={9}>
            {/* Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
              <div className="d-flex align-items-center">
                <span className="text-muted me-3">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </span>
                {searchTerm && (
                  <Badge bg="primary" className="me-2">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge bg="info" className="me-2">
                    Category: {selectedCategory}
                  </Badge>
                )}
              </div>

              <div className="d-flex align-items-center gap-3">
                {/* Sort */}
                <Form.Select
                  size="sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </Form.Select>

                {/* View Toggle */}
                <div className="btn-group" role="group">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <GridView />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <ViewList />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <Row className="g-4">
                {filteredProducts.map((product) => (
                  <Col 
                    key={product._id} 
                    md={viewMode === 'grid' ? 6 : 12} 
                    lg={viewMode === 'grid' ? 4 : 12}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-5">
                <div style={{ fontSize: '4rem', opacity: 0.3 }}>🔍</div>
                <h4 className="text-muted mt-3">No products found</h4>
                <p className="text-muted">
                  Try adjusting your filters or search terms
                </p>
                <Button 
                  className="btn-pet-primary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Products;
