import React, { useEffect, useState } from 'react';
import { getCustomer } from '../api/customer';
import { useParams, useNavigate } from 'react-router-dom';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getCustomer(id)
      .then(res => setCustomer(res.data))
      .catch(() => setError('Failed to load customer'));
  }, [id]);

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!customer) return <div>Loading...</div>;

  return (
    <div>
      <h2>{customer.name}</h2>
      <div>Phone: {customer.phone}</div>
      <div>Email: {customer.email}</div>
      <button style={{marginTop:16}} onClick={() => navigate('/customers')}>Back</button>
    </div>
  );
}
