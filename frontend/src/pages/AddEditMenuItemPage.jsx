import React, { useState, useEffect } from 'react';
import { addMenuItem, editMenuItem, getMenuItem } from '../api/menuItem';
import { useNavigate, useParams } from 'react-router-dom';

export default function AddEditMenuItemPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', description: '', price: '', available: true, restaurantId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
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

  const validate = () => {
    const fe = {};
    if (!form.name.trim()) fe.name = 'Name is required';
    if (!form.description.trim()) fe.description = 'Description is required';
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) fe.price = 'Price must be positive';
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
      if (isEdit) {
        await editMenuItem(id, form);
      } else {
        await addMenuItem(form);
      }
      navigate('/menu-items');
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEdit ? 'Edit' : 'Add'} Menu Item</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      {fieldError.name && <div style={{color:'red'}}>{fieldError.name}</div>}
      <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
      {fieldError.description && <div style={{color:'red'}}>{fieldError.description}</div>}
      <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" />
      {fieldError.price && <div style={{color:'red'}}>{fieldError.price}</div>}
      <input name="restaurantId" value={form.restaurantId} onChange={handleChange} placeholder="Restaurant ID" />
      {fieldError.restaurantId && <div style={{color:'red'}}>{fieldError.restaurantId}</div>}
      <label>
        <input name="available" type="checkbox" checked={form.available} onChange={handleChange} /> Available
      </label>
      <button type="submit" disabled={loading}>{isEdit ? 'Save' : 'Add'}</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
