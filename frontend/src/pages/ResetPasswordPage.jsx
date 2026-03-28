import React, { useState } from 'react';
import { resetPassword } from '../api/auth';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ token: '', newPassword: '' });
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
      await resetPassword(form);
      setMessage('Password reset successful!');
    } catch (err) {
      setError(err.response?.data || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input name="token" value={form.token} onChange={handleChange} placeholder="Reset Token" required />
      <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="New Password" required />
      <button type="submit" disabled={loading}>Reset Password</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {message && <div style={{color:'green'}}>{message}</div>}
    </form>
  );
}
