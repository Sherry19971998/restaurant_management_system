import React, { useState } from 'react';
import { addTable } from '../api/table';
import { useNavigate } from 'react-router-dom';

export default function AddTablePage() {
  const [form, setForm] = useState({ tableNumber: '', capacity: '', status: 'AVAILABLE', restaurantId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addTable(form);
      navigate('/tables');
    } catch (err) {
      setError('Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Table</h2>
      <input name="tableNumber" value={form.tableNumber} onChange={handleChange} placeholder="Table Number" required />
      <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="Capacity" required />
      <input name="restaurantId" value={form.restaurantId} onChange={handleChange} placeholder="Restaurant ID" required />
      <select name="status" value={form.status} onChange={handleChange} required>
        <option value="AVAILABLE">AVAILABLE</option>
        <option value="OCCUPIED">OCCUPIED</option>
        <option value="RESERVED">RESERVED</option>
        <option value="NEEDS_CLEANING">NEEDS_CLEANING</option>
      </select>
      <button type="submit" disabled={loading}>Add</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
