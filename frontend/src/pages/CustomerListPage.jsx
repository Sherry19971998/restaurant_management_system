import React, { useEffect, useState } from 'react';
import { getCustomers } from '../api/customer';
import { Link } from 'react-router-dom';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getCustomers()
      .then(res => setCustomers(res.data))
      .catch(() => setError('Failed to load customers'));
  }, []);

  return (
    <div>
      <h2>Customer List</h2>
      <Link to="/customers/add">Add Customer</Link>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {customers.map(c => (
          <li key={c.id}>
            <Link to={`/customers/${c.id}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
