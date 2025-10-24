import { useEffect, useState } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, Image, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const Profile = () => {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });
  const [editMode, setEditMode] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/profile");
      setProfile(res.data);
      setFormData({
        name: res.data.name || "",
        phone: res.data.phone || "",
        address: res.data.address || {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        },
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setError("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/my");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setError("Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["street", "city", "state", "zip", "country"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put("/user/profile", formData);
      alert("Profile updated successfully!");
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'warning',
      'Paid': 'success',
      'Failed': 'danger'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  const getDeliveryStatusBadge = (status) => {
    const statusColors = {
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please <Link to="/login">login</Link> to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="text-center mb-4">👤 User Profile</h3>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!editMode ? (
        <Card className="mb-4">
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <strong>Name:</strong> {profile.name || "Not set"}
              </Col>
              <Col md={6}>
                <strong>Email:</strong> {profile.email}
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <strong>Phone:</strong> {profile.phone || "Not set"}
              </Col>
            </Row>
            <div className="mb-3">
              <strong>Address:</strong><br />
              {profile?.address?.street ? (
                <span>
                  {profile.address.street}, {profile.address.city}, {profile.address.state}, {profile.address.zip}, {profile.address.country}
                </span>
              ) : (
                <span className="text-muted">No address set</span>
              )}
            </div>
            <Button onClick={() => setEditMode(true)} variant="outline-primary">
              Edit Profile
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleUpdate}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Name</Form.Label>
                  <Form.Control 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={profile.email} readOnly disabled />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </Col>
              </Row>
              <h6 className="mb-3">Address Information</h6>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control 
                    name="street" 
                    value={formData.address.street} 
                    onChange={handleChange}
                    placeholder="Enter street address"
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Label>City</Form.Label>
                  <Form.Control 
                    name="city" 
                    value={formData.address.city} 
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>State</Form.Label>
                  <Form.Control 
                    name="state" 
                    value={formData.address.state} 
                    onChange={handleChange}
                    placeholder="Enter state"
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>ZIP Code</Form.Label>
                  <Form.Control 
                    name="zip" 
                    value={formData.address.zip} 
                    onChange={handleChange}
                    placeholder="Enter ZIP code"
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Country</Form.Label>
                  <Form.Control 
                    name="country" 
                    value={formData.address.country} 
                    onChange={handleChange}
                    placeholder="Enter country"
                  />
                </Col>
              </Row>
              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <hr className="my-4" />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>❤️ Wishlist</h4>
        <div className="d-flex gap-2">
          <Button 
            onClick={() => {
              if (!user) {
                alert('Please login to add items to cart!');
                return;
              }
              wishlist.forEach(product => {
                if (product.inStock) {
                  cartDispatch({ type: 'ADD_TO_CART', payload: product });
                }
              });
              alert('All in-stock items added to cart!');
            }}
            variant="outline-success" 
            size="sm"
          >
            Move All to Cart
          </Button>
          <Button as={Link} to="/wishlist" variant="outline-primary" size="sm">
            View All ({wishlist.length})
          </Button>
        </div>
      </div>
      <Row>
        {wishlist.length > 0 ? wishlist.slice(0, 3).map(product => (
          <Col md={4} key={product._id} className="mb-3">
            <Card>
              <Card.Img 
                variant="top" 
                src={product.imageUrl ? `${import.meta.env.VITE_API_BASE_URL}/${product.imageUrl.replace(/\\/g, '/')}` : '/pet images/collar.jpeg'} 
                onError={(e) => {
                  e.target.src = '/pet images/collar.jpeg';
                }}
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>₹{product.price}</Card.Text>
                <Button
                  onClick={() => {
                    if (!user) {
                      alert('Please login to add items to cart!');
                      return;
                    }
                    cartDispatch({ type: 'ADD_TO_CART', payload: product });
                    alert('Added to cart!');
                  }}
                  variant="outline-primary"
                  size="sm"
                  className="w-100"
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )) : <p>No items in wishlist.</p>}
        {wishlist.length > 3 && (
          <Col md={12} className="text-center">
            <Button as={Link} to="/wishlist" variant="outline-primary">
              View All {wishlist.length} Items
            </Button>
          </Col>
        )}
      </Row>

      <hr className="my-4" />

      <h4>🧾 My Orders</h4>
      {orders.length > 0 ? (
        orders.map(order => (
          <Card key={order._id} className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Order #{order._id.slice(-8)}</strong>
                <br />
                <small className="text-muted">
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </small>
              </div>
              <div className="text-end">
                <div className="mb-1">
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
                <div>
                  {getDeliveryStatusBadge(order.deliveryStatus)}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {order.products && order.products.length > 0 ? (
                order.products.map((item, idx) => (
                  <div key={idx} className="mb-3 d-flex align-items-center gap-3">
                    <Image 
                      src={item.product?.imageUrl ? `${import.meta.env.VITE_API_BASE_URL}/${item.product.imageUrl.replace(/\\/g, '/')}` : '/pet images/collar.jpeg'} 
                      height={60} 
                      width={60} 
                      thumbnail 
                      onError={(e) => {
                        e.target.src = '/pet images/collar.jpeg';
                      }}
                    />
                    <div className="flex-grow-1">
                      <div><strong>{item.product?.name || 'Product'}</strong></div>
                      <div className="text-muted">
                        Quantity: {item.quantity} × ₹{item.product?.price || 0}
                      </div>
                    </div>
                    <div className="text-end">
                      <strong>₹{(item.product?.price || 0) * item.quantity}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No products in this order</p>
              )}
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Total Amount:</strong> ₹{order.totalAmount}
                </div>
                {order.paymentResult && (
                  <div className="text-muted">
                    <small>PayPal Order: {order.paymentResult.paypalOrderId}</small>
                  </div>
                )}
              </div>
              {order.paidAt && (
                <div className="text-muted mt-2">
                  <small>Paid on: {new Date(order.paidAt).toLocaleDateString()}</small>
                </div>
              )}
            </Card.Body>
          </Card>
        ))
      ) : (
        <Card>
          <Card.Body className="text-center">
            <p className="text-muted mb-0">No orders yet.</p>
            <Link to="/products" className="btn btn-primary mt-2">
              Start Shopping
            </Link>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Profile;
