import React, { useState } from 'react';
import { addReservation } from '../api/reservation';
import { useNavigate } from 'react-router-dom';

export default function AddReservationPage() {
  const [form, setForm] = useState({ reservationTime: '', partySize: '', status: 'CONFIRMED', diningTableId: '', customerId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addReservation(form);
      navigate('/reservations');
    } catch (err) {
      setError('Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Reservation</h2>
      <input name="reservationTime" value={form.reservationTime} onChange={handleChange} placeholder="Reservation Time (YYYY-MM-DDTHH:mm:ss)" required />
      <input name="partySize" type="number" value={form.partySize} onChange={handleChange} placeholder="Party Size" required />
      <input name="diningTableId" value={form.diningTableId} onChange={handleChange} placeholder="Table ID" required />
      <input name="customerId" value={form.customerId} onChange={handleChange} placeholder="Customer ID" required />
      <select name="status" value={form.status} onChange={handleChange} required>
        <option value="CONFIRMED">CONFIRMED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      <button type="submit" disabled={loading}>Add</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
