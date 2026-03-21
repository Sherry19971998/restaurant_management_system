import React, { useEffect, useState } from 'react';
import { getOrders } from '../api/order';
import { Link } from 'react-router-dom';

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrders()
      .then(res => setOrders(res.data))
      .catch(() => setError('Failed to load orders'));
  }, []);

  return (
    <div>
      <h2>Order List</h2>
      <Link to="/orders/place">Place Order</Link>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {orders.map(o => (
          <li key={o.id}>
            <Link to={`/orders/${o.id}`}>Order #{o.id} (Status: {o.status})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
