
import React, { useState } from 'react';
import { addCustomer } from '../api/customer';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCustomerId } from '../slices/userSlice';


export default function AddCustomerPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const fe = {};
    if (!form.name.trim()) fe.name = 'Name is required';
    if (!form.phone.trim()) fe.phone = 'Phone is required';
    if (!form.email.trim()) fe.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) fe.email = 'Invalid email format';
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
      const res = await addCustomer(form);
      const customerId = res?.data?.id;
      if (customerId) {
        dispatch(setCustomerId(customerId));
        // 不自动跳转，留在页面
      } else {
        setError('Customer created but no ID returned');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Customer</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      {fieldError.name && <div style={{color:'red'}}>{fieldError.name}</div>}
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
      {fieldError.phone && <div style={{color:'red'}}>{fieldError.phone}</div>}
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      {fieldError.email && <div style={{color:'red'}}>{fieldError.email}</div>}
      <button type="submit" disabled={loading}>Add</button>
      <button type="button" style={{marginLeft:16}} onClick={() => navigate('/customers')}>Back</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
