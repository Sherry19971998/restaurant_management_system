

import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getOrders } from '../api/order';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const newOrderId = location.state?.newOrderId;

  useEffect(() => {
    getOrders()
      .then(res => setOrders(res.data))
      .catch(() => setError('Failed to load orders'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'user/logout' });
    navigate('/login');
  };

  return (
    <div>
      {/* Navigation Bar */}
      <div style={{ background: '#f0f2f5', padding: '10px 0', textAlign: 'center', marginBottom: 20 }}>
        <button style={{ margin: '0 12px' }} onClick={() => navigate('/customers')}>Customer Management</button>
        <button style={{ margin: '0 12px' }} onClick={() => navigate('/reservations')}>Reservation Management</button>
        <button style={{ margin: '0 12px' }} onClick={() => navigate('/orders')}>Order Management</button>
        <button onClick={handleLogout} style={{ marginLeft: 16, color: 'red' }}>Logout</button>
      </div>
      <h2>Order List</h2>
      <Link to="/orders/place">Place Order</Link>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {orders.map(o => (
          <li key={o.id} style={newOrderId && o.id === newOrderId ? { background: '#e6f7ff', fontWeight: 'bold' } : {}}>
            <Link to={`/orders/${o.id}`}>Order #{o.id} (Status: {o.status})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
