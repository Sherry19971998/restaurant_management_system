import React, { useState } from 'react';
import { addCustomer } from '../api/customer';
import { useNavigate } from 'react-router-dom';

export default function AddCustomerPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addCustomer(form);
      navigate('/customers');
    } catch (err) {
      setError('Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Customer</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <button type="submit" disabled={loading}>Add</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
