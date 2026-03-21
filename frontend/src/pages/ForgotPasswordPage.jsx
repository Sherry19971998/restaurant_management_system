import React, { useState } from 'react';
import { forgotPassword } from '../api/auth';

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ emailOrUsername: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await forgotPassword(form);
      setMessage('Password reset link sent!');
    } catch (err) {
      setError(err.response?.data || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <input name="emailOrUsername" value={form.emailOrUsername} onChange={handleChange} placeholder="Username or Email" required />
      <button type="submit" disabled={loading}>Send Reset Link</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {message && <div style={{color:'green'}}>{message}</div>}
    </form>
  );
}
