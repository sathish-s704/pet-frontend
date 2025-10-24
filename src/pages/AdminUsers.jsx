import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { Table, Button, Modal, Form, Alert, Badge, Row, Col, Card } from 'react-bootstrap';
import api from '../utils/api';

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    blockedUsers: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
    else fetchUsers();
  }, [user, navigate]);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${user?.token}` }
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
      
      // Calculate stats
      const stats = {
        totalUsers: response.data.length,
        activeUsers: response.data.filter(u => !u.isBlocked).length,
        adminUsers: response.data.filter(u => u.role === 'admin').length,
        blockedUsers: response.data.filter(u => u.isBlocked).length
      };
      setUserStats(stats);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userData) => {
    setSelectedUser(userData);
    setShowModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/admin/users/${selectedUser._id}`, {
        role: selectedUser.role,
        isBlocked: selectedUser.isBlocked
      });
      
      await fetchUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        await api.delete(`/admin/users/${userId}`);
        await fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <Button variant="outline-primary" onClick={fetchUsers} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* User Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h4 className="text-primary">{userStats.totalUsers}</h4>
              <p className="mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body>
              <h4 className="text-success">{userStats.activeUsers}</h4>
              <p className="mb-0">Active Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h4 className="text-warning">{userStats.adminUsers}</h4>
              <p className="mb-0">Admin Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-danger">
            <Card.Body>
              <h4 className="text-danger">{userStats.blockedUsers}</h4>
              <p className="mb-0">Blocked Users</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Users Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">All Users</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(userData => (
                <tr key={userData._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                           style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                        {userData.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {userData.name || 'No Name'}
                    </div>
                  </td>
                  <td>{userData.email}</td>
                  <td>
                    <Badge bg={userData.role === 'admin' ? 'primary' : 'secondary'}>
                      {userData.role || 'user'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={userData.isBlocked ? 'danger' : 'success'}>
                      {userData.isBlocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </td>
                  <td>{new Date(userData.createdAt).toLocaleDateString()}</td>
                  <td>{userData.lastActive ? new Date(userData.lastActive).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleEditUser(userData)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      {userData._id !== user._id && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteUser(userData._id, userData.name)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleUpdateUser}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User: {selectedUser?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={selectedUser?.email || ''} 
                readOnly 
                className="bg-light"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={selectedUser?.role || 'user'}
                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Block this user"
                checked={selectedUser?.isBlocked || false}
                onChange={(e) => setSelectedUser({...selectedUser, isBlocked: e.target.checked})}
              />
              <Form.Text className="text-muted">
                Blocked users cannot login to the system
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </AdminLayout>
  );
};
export default AdminUsers; 