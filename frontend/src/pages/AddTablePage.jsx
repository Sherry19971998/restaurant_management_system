import React, { useState } from 'react';
import { addTable } from '../api/table';
import { useNavigate } from 'react-router-dom';

export default function AddTablePage() {
  const [form, setForm] = useState({ tableNumber: '', capacity: '', status: 'AVAILABLE', restaurantId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const fe = {};
    if (!form.tableNumber.trim()) fe.tableNumber = 'Table number is required';
    if (!form.capacity || isNaN(form.capacity) || parseInt(form.capacity) <= 0) fe.capacity = 'Capacity must be positive';
    if (!form.restaurantId.trim()) fe.restaurantId = 'Restaurant ID is required';
    return fe;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fe = validate();
    setFieldError(fe);
    if (Object.keys(fe).length > 0) {
      setLoading(false);
      return;
    }
    try {
      await addTable(form);
      // Do not navigate after add; stay on page
    } catch (err) {
      setError(err?.response?.data?.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Table</h2>
      <input name="tableNumber" value={form.tableNumber} onChange={handleChange} placeholder="Table Number" />
      {fieldError.tableNumber && <div style={{color:'red'}}>{fieldError.tableNumber}</div>}
      <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="Capacity" />
      {fieldError.capacity && <div style={{color:'red'}}>{fieldError.capacity}</div>}
      <input name="restaurantId" value={form.restaurantId} onChange={handleChange} placeholder="Restaurant ID" />
      {fieldError.restaurantId && <div style={{color:'red'}}>{fieldError.restaurantId}</div>}
      <select name="status" value={form.status} onChange={handleChange} required>
        <option value="AVAILABLE">AVAILABLE</option>
        <option value="OCCUPIED">OCCUPIED</option>
        <option value="RESERVED">RESERVED</option>
        <option value="NEEDS_CLEANING">NEEDS_CLEANING</option>
      </select>
      <button type="submit" disabled={loading}>Add</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      <button type="button" style={{marginTop:16}} onClick={() => navigate('/tables')}>Back</button>
    </form>
  );
}
