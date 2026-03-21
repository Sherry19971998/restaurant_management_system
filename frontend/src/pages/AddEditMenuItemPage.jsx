import React, { useState, useEffect } from 'react';
import { addMenuItem, editMenuItem, getMenuItem } from '../api/menuItem';
import { useNavigate, useParams } from 'react-router-dom';

export default function AddEditMenuItemPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', description: '', price: '', available: true, restaurantId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      getMenuItem(id).then(res => setForm(res.data)).catch(() => setError('Load failed'));
    }
  }, [id, isEdit]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await editMenuItem(id, form);
      } else {
        await addMenuItem(form);
      }
      navigate('/menu-items');
    } catch {
      setError('Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Edit' : 'Add'} Menu Item</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
      <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
      <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required />
      <input name="restaurantId" value={form.restaurantId} onChange={handleChange} placeholder="Restaurant ID" required />
      <label>
        <input name="available" type="checkbox" checked={form.available} onChange={handleChange} /> Available
      </label>
      <button type="submit" disabled={loading}>{isEdit ? 'Save' : 'Add'}</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
