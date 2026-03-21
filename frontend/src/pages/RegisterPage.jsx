import React, { useState } from 'react';
import { register } from '../api/auth';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', roles: ['USER'] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      alert('Registration successful!');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
      <button type="submit" disabled={loading}>Register</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
