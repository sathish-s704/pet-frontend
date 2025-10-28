import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { Table, Button, Modal, Form, Alert, Badge, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { Search, Eye } from 'react-bootstrap-icons';
import api from '../utils/api';

const AdminOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingPayments: 0,
    paidOrders: 0,
    deliveredOrders: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
    else fetchOrders();
  }, [user, navigate]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'payment') {
        filtered = filtered.filter(order => order.paymentStatus === 'Pending');
      } else if (statusFilter === 'delivery') {
        filtered = filtered.filter(order => order.deliveryStatus === 'Processing');
      } else {
        filtered = filtered.filter(order => 
          order.paymentStatus === statusFilter || order.deliveryStatus === statusFilter
        );
      }
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data);
      
      // Calculate stats
      const stats = {
        totalOrders: response.data.length,
        pendingPayments: response.data.filter(o => o.paymentStatus === 'Pending').length,
        paidOrders: response.data.filter(o => o.paymentStatus === 'Paid').length,
        deliveredOrders: response.data.filter(o => o.deliveryStatus === 'Delivered').length
      };
      setOrderStats(stats);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateOrderStatus = async (orderId, updates) => {
    try {
      setLoading(true);
      await api.put(`/orders/${orderId}`, updates);
      await fetchOrders();
      setShowModal(false);
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      'Pending': 'warning',
      'Paid': 'success',
      'Failed': 'danger'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  const getDeliveryStatusBadge = (status) => {
    const colors = {
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Management</h2>
        <Button variant="outline-primary" onClick={fetchOrders} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Order Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h4 className="text-primary">{orderStats.totalOrders}</h4>
              <p className="mb-0">Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h4 className="text-warning">{orderStats.pendingPayments}</h4>
              <p className="mb-0">Pending Payments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body>
              <h4 className="text-success">{orderStats.paidOrders}</h4>
              <p className="mb-0">Paid Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-info">
            <Card.Body>
              <h4 className="text-info">{orderStats.deliveredOrders}</h4>
              <p className="mb-0">Delivered</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><Search /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="payment">Pending Payments</option>
                <option value="delivery">Pending Delivery</option>
                <option value="Paid">Paid Orders</option>
                <option value="Delivered">Delivered Orders</option>
                <option value="Cancelled">Cancelled Orders</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Orders ({filteredOrders.length})</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Delivery Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td>
                    <code>#{order._id.slice(-8)}</code>
                  </td>
                  <td>
                    <div>
                      <div className="fw-bold">{order.user?.name || 'Unknown'}</div>
                      <small className="text-muted">{order.user?.email}</small>
                    </div>
                  </td>
                  <td>{order.products?.length || 0} items</td>
                  <td className="fw-bold">₹{order.totalAmount}</td>
                  <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                  <td>{getDeliveryStatusBadge(order.deliveryStatus)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="me-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details - #{selectedOrder?._id.slice(-8)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              {/* Customer Info */}
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Customer Information</h6>
                  <p className="mb-1"><strong>Name:</strong> {selectedOrder.user?.name}</p>
                  <p className="mb-1"><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  <p className="mb-1"><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </Col>
                <Col md={6}>
                  <h6>Order Status</h6>
                  <p className="mb-1"><strong>Payment:</strong> {getPaymentStatusBadge(selectedOrder.paymentStatus)}</p>
                  <p className="mb-1"><strong>Delivery:</strong> {getDeliveryStatusBadge(selectedOrder.deliveryStatus)}</p>
                  <p className="mb-1"><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}</p>
                </Col>
              </Row>

              {/* Products */}
              <h6>Ordered Products</h6>
              <Table striped size="sm" className="mb-4">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name || item.product?.name || 'Unknown Product'}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price || item.product?.price || 0}</td>
                      <td>₹{(item.quantity * (item.price || item.product?.price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Update Status Forms */}
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Update Payment Status</Form.Label>
                    <Form.Select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, { paymentStatus: e.target.value })}
                      disabled={loading}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Update Delivery Status</Form.Label>
                    <Form.Select
                      value={selectedOrder.deliveryStatus}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, { deliveryStatus: e.target.value })}
                      disabled={loading}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};
export default AdminOrders; 

