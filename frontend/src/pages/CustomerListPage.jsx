import React, { useEffect, useState } from 'react';
import { getCustomers } from '../api/customer';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    getCustomers()
      .then(res => {
        if (Array.isArray(res.data)) {
          setCustomers(res.data);
        } else if (res.data && res.data.message) {
          setError(res.data.message);
        } else {
          setError('Failed to load customers');
        }
      })
      .catch(() => setError('Failed to load customers'));
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
      <h2>Customer List</h2>
      <Link to="/customers/add">Add Customer</Link>
      {error && <div style={{color:'red'}}>{error}</div>}
      {Array.isArray(customers) && (
        <ul>
          {customers.map(c => (
            <li key={c.id}>
              <Link to={`/customers/${c.id}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
