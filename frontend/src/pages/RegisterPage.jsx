import React, { useState } from 'react';
import { register } from '../api/auth';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', roles: ['USER'] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const fe = {};
    if (!form.username.trim()) fe.username = 'Username is required';
    if (!form.password) fe.password = 'Password is required';
    else if (form.password.length < 6) fe.password = 'Password must be at least 6 characters';
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
      await register(form);
      alert('Registration successful!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
      {fieldError.username && <div style={{color:'red'}}>{fieldError.username}</div>}
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
      {fieldError.password && <div style={{color:'red'}}>{fieldError.password}</div>}
      <button type="submit" disabled={loading}>Register</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
