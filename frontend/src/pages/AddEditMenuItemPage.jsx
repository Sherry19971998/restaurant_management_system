/*import React, { useState, useEffect } from 'react';
import { addMenuItem, editMenuItem, getMenuItem } from '../api/menuItem';
import { useNavigate, useParams } from 'react-router-dom';

export default function AddEditMenuItemPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', description: '', price: '', available: true, restaurantId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [success, setSuccess] = useState(false);
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
        navigate('/menu-items'); // Only navigate after edit
      } else {
        await addMenuItem(form);
        // Do not navigate after add; stay on page
      }
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
      <button type="button" style={{marginTop:16}} onClick={() => navigate('/menu-items')}>Back</button>
    </form>
  );
}
*/


import React, { useState, useEffect } from 'react';
import { addMenuItem, editMenuItem, getMenuItem, deleteMenuItem } from '../api/menuItem';
import { useNavigate, useParams } from 'react-router-dom';

export default function AddEditMenuItemPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', description: '', price: '', available: true, restaurantId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [success, setSuccess] = useState(false);
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
    if (form.restaurantId === undefined || form.restaurantId === null || form.restaurantId.toString().trim() === '') fe.restaurantId = 'Restaurant ID is required';
    return fe;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const fe = validate();
    setFieldError(fe);
    if (Object.keys(fe).length > 0) { setLoading(false); return; }
    try {
      if (isEdit) {
        await editMenuItem(id, form);
        navigate('/menu-items');
      } else {
        await addMenuItem(form);
        setSuccess(true);
        setForm({ name: '', description: '', price: '', available: true, restaurantId: '' });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.name}"?`)) return;
    try {
      await deleteMenuItem(id);
      navigate('/menu-items');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Delete failed';
      if (msg.includes('referenced by existing orders')) {
        window.alert('This menu item is referenced by existing orders and cannot be deleted.');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '0 1rem' }}>
      <button onClick={() => navigate('/menu-items')} style={{ marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
        ← Back to Menu Items
      </button>

      <h2>{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Name</label>
          <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Name"
            style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box' }} />
          {fieldError.name && <div style={{ color: 'red', fontSize: 12, marginTop: 2 }}>{fieldError.name}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Description</label>
          <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Description" rows={3}
            style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
          {fieldError.description && <div style={{ color: 'red', fontSize: 12, marginTop: 2 }}>{fieldError.description}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Price</label>
          <input name="price" type="number" min="0" step="0.01" value={form.price === undefined || form.price === null ? "" : form.price} onChange={handleChange} placeholder="0.00"
            style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box' }} />
          {fieldError.price && <div style={{ color: 'red', fontSize: 12, marginTop: 2 }}>{fieldError.price}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Restaurant ID</label>
          <input name="restaurantId" value={form.restaurantId === undefined || form.restaurantId === null ? "" : form.restaurantId} onChange={handleChange} placeholder="Restaurant ID"
            style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box' }} />
          {fieldError.restaurantId && <div style={{ color: 'red', fontSize: 12, marginTop: 2 }}>{fieldError.restaurantId}</div>}
        </div>

        <div>
          <label style={{ fontSize: 14 }}>
            <input name="available" type="checkbox" checked={form.available} onChange={handleChange} style={{ marginRight: 8 }} />
            Available
          </label>
        </div>

        {(!isEdit && success) && <div style={{ color: 'green', fontSize: 14, marginTop: 8 }}>add successfully</div>}
        {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="submit" disabled={loading}
            style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
          </button>
          {!isEdit && (
            <button type="button" onClick={() => navigate('/menu-items')}
              style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>
              Back
            </button>
          )}
          {isEdit && (
            <button type="button" onClick={handleDelete}
              style={{ padding: '8px 20px', fontSize: 14, cursor: 'pointer', color: 'red' }}>
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

