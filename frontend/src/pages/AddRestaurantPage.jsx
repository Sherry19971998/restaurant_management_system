import React, { useState } from 'react';
import { addRestaurant } from '../api/restaurant';
import { useNavigate } from 'react-router-dom';

export default function AddRestaurantPage() {
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addRestaurant(form);
      navigate('/restaurants');
    } catch (err) {
      setError('Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Restaurant</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
      <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
      <button type="submit" disabled={loading}>Add</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
