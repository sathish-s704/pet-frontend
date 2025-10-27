import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Row, Col, Card, Table } from 'react-bootstrap';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const { user } = useAuth();

  // State for summary data
  const [summary, setSummary] = useState({
    products: 0,
    users: 0,
    orders: 0,
    income: 0,
    orderHistory: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats from admin endpoint
        const statsRes = await api.get('/admin/dashboard');
        
        setSummary({
          products: statsRes.data.totalProducts || 0,
          users: statsRes.data.totalUsers || 0,
          orders: statsRes.data.totalOrders || 0,
          income: statsRes.data.totalIncome || 0,
          orderHistory: statsRes.data.orders || [],
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setSummary({
          products: 0,
          users: 0,
          orders: 0,
          income: 0,
          orderHistory: [],
        });
      }
    };
    
    if (user?.token) {
      fetchData();
    }
  }, [user]);

  return (
    <AdminLayout>
      <h2 className="mb-4">Dashboard</h2>
      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Total Products</Card.Title>
              <Card.Text className="fs-3 fw-bold text-primary">{summary.products}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <Card.Text className="fs-3 fw-bold text-success">{summary.users}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Total Orders</Card.Title>
              <Card.Text className="fs-3 fw-bold text-warning">{summary.orders}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Total Income</Card.Title>
              <Card.Text className="fs-3 fw-bold text-danger">₹{summary.income}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Order History Table */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Order History</Card.Title>
          <Table responsive hover className="mt-3">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User Name</th>
                <th>Product Count</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {summary.orderHistory.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user}</td>
                  <td>{order.count}</td>
                  <td>₹{order.total}</td>
                  <td>{order.status}</td>
                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard; 

