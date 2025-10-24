import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Table, Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import AdminLayout from '../components/AdminLayout';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', 
    actualPrice: '', 
    discount: 0, 
    price: '', 
    category: '', 
    description: '', 
    totalStock: '', 
    inStock: true, 
    image: null
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthConfig = (isMultipart = false) => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isMultipart && { 'Content-Type': 'multipart/form-data' })
      }
    };
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const res = await api.get('/products');
      console.log('Products fetched:', res.data);
      setProducts(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      console.error('Fetch error response:', err.response?.data);
      setError(`Failed to fetch products: ${err.response?.data?.message || err.message}`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate final price when actual price or discount changes
  useEffect(() => {
    if (formData.actualPrice && formData.discount >= 0) {
      const actualPrice = parseFloat(formData.actualPrice);
      const discount = parseFloat(formData.discount);
      const finalPrice = actualPrice - (actualPrice * discount / 100);
      setFormData(prev => ({ ...prev, price: finalPrice.toFixed(2) }));
    }
  }, [formData.actualPrice, formData.discount]);

  const handleClose = () => {
    setShowModal(false);
    setFormData({ 
      name: '', 
      actualPrice: '', 
      discount: 0, 
      price: '', 
      category: '', 
      description: '', 
      totalStock: '', 
      image: null 
    });
    setEditingProductId(null);
    setError('');
  };

  const handleAdd = () => {
    setEditingProductId(null);
    setFormData({ 
      name: '', 
      actualPrice: '', 
      discount: 0, 
      price: '', 
      category: '', 
      description: '', 
      totalStock: '', 
      image: null 
    });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    console.log('Editing product:', product);
    setEditingProductId(product._id);
    setFormData({
      name: product.name || '',
      actualPrice: (product.actualPrice || product.price || 0).toString(),
      discount: (product.discount || 0).toString(),
      price: (product.price || 0).toString(),
      category: product.category || '',
      description: product.description || '',
      totalStock: (product.totalStock || 0).toString(),
      image: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('actualPrice', formData.actualPrice);
      data.append('discount', formData.discount);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('totalStock', formData.totalStock);
      // Remove inStock from form data - it will be auto-managed by backend
      if (formData.image) {
        data.append('image', formData.image);
      }

      // Debug logging
      console.log('Form data being submitted:', {
        name: formData.name,
        actualPrice: formData.actualPrice,
        discount: formData.discount,
        price: formData.price,
        category: formData.category,
        description: formData.description,
        totalStock: formData.totalStock,
        editingProductId
      });

      if (editingProductId) {
        const response = await api.put(`/products/${editingProductId}`, data);
        console.log('Update response:', response.data);
      } else {
        const response = await api.post('/products', data);
        console.log('Create response:', response.data);
      }

      fetchProducts();
      handleClose();
    } catch (err) {
      console.error('Submit error:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to save product: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Products</h2>
        <Button variant="primary" onClick={handleAdd}>
          Add New Product
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Actual Price</th>
            <th>Discount</th>
            <th>Final Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>
                <img 
                  src={product.imageUrl ? `http://localhost:3000/${product.imageUrl}` : '/pet images/collar.jpeg'} 
                  alt={product.name}
                  width="50" 
                  height="50" 
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/pet images/collar.jpeg';
                  }}
                />
              </td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>₹{product.actualPrice || product.price}</td>
              <td>{product.discount || 0}%</td>
              <td>₹{product.price}</td>
              <td>{product.totalStock || 'N/A'}</td>
              <td>
                <span className={`badge ${product.inStock ? 'bg-success' : 'bg-danger'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEdit(product)}
                  disabled={loading}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDelete(product._id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Enhanced Product Form Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingProductId ? 'Edit Product' : 'Add New Product'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <Alert variant="danger">{error}</Alert>
            )}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter product name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Toys">Toys</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Health">Health</option>
                    <option value="Grooming">Grooming</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Actual Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.actualPrice}
                    onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Final Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.price}
                    readOnly
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Calculated automatically
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.totalStock}
                    onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })}
                    required
                    placeholder="Enter total stock quantity"
                  />
                  <Form.Text className="text-muted">
                    Stock status will be automatically managed based on quantity
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    accept="image/*"
                  />
                  <Form.Text className="text-muted">
                    Accepted formats: JPG, PNG, JPEG
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
              />
            </Form.Group>

            {/* Show current stock status (read-only) */}
            <Form.Group className="mb-3">
              <Form.Label>Stock Status</Form.Label>
              <div className="d-flex align-items-center">
                <span className={`badge ${parseInt(formData.totalStock) > 0 ? 'bg-success' : 'bg-danger'} me-2`}>
                  {parseInt(formData.totalStock) > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                <small className="text-muted">
                  {parseInt(formData.totalStock) > 0 
                    ? `${formData.totalStock} items available`
                    : 'Add stock to make this product available'
                  }
                </small>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingProductId ? 'Update Product' : 'Add Product')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

export default AdminProducts;
