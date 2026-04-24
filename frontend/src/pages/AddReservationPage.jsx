import React, { useState } from 'react';
import { addReservation, getReservations } from '../api/reservation';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setReservationId } from '../slices/userSlice';
import { getCustomerByPhone } from '../api/customer';
import { getTable, getTables } from '../api/table';

export default function AddReservationPage() {
  const [form, setForm] = useState({ startTime: '', endTime: '', partySize: '', status: 'CONFIRMED', diningTableId: '', customerId: '' });
  const [phone, setPhone] = useState('');
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [availableTables, setAvailableTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // 手机号查重
  const handleCheckPhone = async () => {
    setCheckingPhone(true);
    setError('');
    try {
      const res = await getCustomerByPhone(phone);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setForm(f => ({ ...f, customerId: res.data[0].id }));
      } else {
        navigate('/customers/add');
      }
    } catch (err) {
      setError('Failed to check phone');
    } finally {
      setCheckingPhone(false);
    }
  };

  const validate = () => {
    const fe = {};
    if (!form.startTime.trim()) fe.startTime = 'Start time is required';
    else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(form.startTime)) fe.startTime = 'Invalid start datetime format';
    if (!form.endTime.trim()) fe.endTime = 'End time is required';
    else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(form.endTime)) fe.endTime = 'Invalid end datetime format';
    if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) fe.endTime = 'End time must be after start time';
    if (!form.partySize || isNaN(form.partySize) || parseInt(form.partySize) <= 0) fe.partySize = 'Party size must be positive';
    if (!String(form.customerId).trim()) fe.customerId = 'Customer ID is required';
    return fe;
  };

  // 查询可用桌子
  const fetchAvailableTables = async () => {
    setTablesLoading(true);
    setAvailableTables([]);
    setError('');
    try {
      const [tablesRes, reservationsRes] = await Promise.all([
        getTables(),
        getReservations()
      ]);
      const tables = tablesRes.data;
      const reservations = reservationsRes.data;
      const startTime = new Date(form.startTime);
      const endTime = new Date(form.endTime);
      const filtered = tables.filter(table => {
        if (parseInt(form.partySize) > table.capacity) return false;
        const hasConflict = reservations.some(r => {
          if (r.diningTableId !== table.id) return false;
          const rStart = new Date(r.startTime || r.reservationTime);
          const rEnd = new Date(r.endTime || (rStart.getTime() + 60 * 60 * 1000));
          return (startTime < rEnd && endTime > rStart);
        });
        return !hasConflict;
      });
      setAvailableTables(filtered);
      if (filtered.length === 0) {
        setError('No available table for this time and party size.');
      }
    } catch (err) {
      setError('Failed to fetch available tables');
    } finally {
      setTablesLoading(false);
    }
  };

  // 提交时直接用用户选择的桌子
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
      const payload = { ...form };
      const res = await addReservation(payload);
      const reservationId = res?.data?.id;
      if (reservationId) {
        dispatch(setReservationId(reservationId));
        // 不自动跳转，留在页面
      } else {
        setError('Reservation created but no ID returned');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  // 表单顶部增加手机号查重
  return (
    <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', maxWidth:400, margin:'0 auto', gap:16}}>
      <h2 style={{marginBottom: 16}}>Add Reservation</h2>
      <label style={{marginBottom:4}}>Customer Phone</label>
      <div style={{display:'flex', flexDirection:'row', gap:8, marginBottom:4}}>
        <input
          name="phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Enter customer phone for duplicate check"
          style={{flex:1}}
        />
        <button type="button" onClick={handleCheckPhone} disabled={checkingPhone || !phone.trim()}>
          {checkingPhone ? 'Checking...' : 'Check Phone'}
        </button>
      </div>
      {error && <div style={{color:'red', marginBottom:4}}>{error}</div>}
      <label style={{marginBottom:4}}>Start Time</label>
      <input name="startTime" value={form.startTime} onChange={handleChange} placeholder="Start Time (YYYY-MM-DDTHH:mm:ss)" />
      {fieldError.startTime && <div style={{color:'red', marginBottom:4}}>{fieldError.startTime}</div>}
      <label style={{marginBottom:4}}>End Time</label>
      <input name="endTime" value={form.endTime} onChange={handleChange} placeholder="End Time (YYYY-MM-DDTHH:mm:ss)" />
      {fieldError.endTime && <div style={{color:'red', marginBottom:4}}>{fieldError.endTime}</div>}
      <label style={{marginBottom:4}}>Party Size</label>
      <input name="partySize" type="number" value={form.partySize} onChange={handleChange} placeholder="Party Size" />
      {fieldError.partySize && <div style={{color:'red', marginBottom:4}}>{fieldError.partySize}</div>}

      <label style={{marginBottom:4}}>Table</label>
      <div style={{display:'flex', flexDirection:'row', gap:8, alignItems:'center'}}>
        <select
          name="diningTableId"
          value={form.diningTableId}
          onChange={handleChange}
          style={{flex:1}}
          required
        >
          <option value="">-- Select Table --</option>
          {availableTables.map(t => (
            <option key={t.id} value={t.id}>{`T${t.tableNumber} (Capacity: ${t.capacity})`}</option>
          ))}
        </select>
        <button type="button" onClick={fetchAvailableTables} disabled={tablesLoading || !form.startTime || !form.endTime || !form.partySize}>
          {tablesLoading ? 'Loading...' : 'Check Available'}
        </button>
      </div>
      {fieldError.diningTableId && <div style={{color:'red', marginBottom:4}}>{fieldError.diningTableId}</div>}

      <label style={{marginBottom:4}}>Customer ID</label>
      <input name="customerId" value={form.customerId} disabled placeholder="Customer ID" />
      {fieldError.customerId && <div style={{color:'red', marginBottom:4}}>{fieldError.customerId}</div>}
      <label style={{marginBottom:4}}>Status</label>
      <select name="status" value={form.status} onChange={handleChange} required>
        <option value="CONFIRMED">CONFIRMED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      <div style={{display:'flex', flexDirection:'row', gap:8, marginTop:8}}>
        <button type="submit" disabled={loading}>Add</button>
        <button type="button" onClick={() => navigate('/reservations')}>Back</button>
      </div>
    </form>
  );
}