import React, { useState } from 'react';
import { addReservation } from '../api/reservation';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setReservationId } from '../slices/userSlice';

export default function AddReservationPage() {
  const customerId = useSelector(state => state.user.customerId);
  const [form, setForm] = useState({ reservationTime: '', partySize: '', status: 'CONFIRMED', diningTableId: '', customerId: customerId || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const fe = {};
      if (!form.reservationTime.trim()) fe.reservationTime = 'Reservation time is required';
      else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(form.reservationTime)) fe.reservationTime = 'Invalid datetime format';
      if (!form.partySize || isNaN(form.partySize) || parseInt(form.partySize) <= 0) fe.partySize = 'Party size must be positive';
      if (!form.diningTableId.trim()) fe.diningTableId = 'Table ID is required';
      if (!String(form.customerId).trim()) fe.customerId = 'Customer ID is required';
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
      const res = await addReservation(form);
      const reservationId = res?.data?.id;
      if (reservationId) {
        dispatch(setReservationId(reservationId));
        navigate('/orders/place');
      } else {
        setError('Reservation created but no ID returned');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Reservation</h2>
      <input name="reservationTime" value={form.reservationTime} onChange={handleChange} placeholder="Reservation Time (YYYY-MM-DDTHH:mm:ss)" />
      {fieldError.reservationTime && <div style={{color:'red'}}>{fieldError.reservationTime}</div>}
      <input name="partySize" type="number" value={form.partySize} onChange={handleChange} placeholder="Party Size" />
      {fieldError.partySize && <div style={{color:'red'}}>{fieldError.partySize}</div>}
      <input name="diningTableId" value={form.diningTableId} onChange={handleChange} placeholder="Table ID" />
      {fieldError.diningTableId && <div style={{color:'red'}}>{fieldError.diningTableId}</div>}
      <input name="customerId" value={form.customerId} disabled placeholder="Customer ID" />
      {fieldError.customerId && <div style={{color:'red'}}>{fieldError.customerId}</div>}
      <select name="status" value={form.status} onChange={handleChange} required>
        <option value="CONFIRMED">CONFIRMED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      <button type="submit" disabled={loading}>Add</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
