

import { useNavigate, Link } from 'react-router-dom';
import { getReservations } from '../api/reservation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function ReservationListPage() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    getReservations()
      .then(res => setReservations(res.data))
      .catch(() => setError('Failed to load reservations'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'user/logout' });
    navigate('/login');
  };

  return (
    <div>
      {/* Navigation Bar */}
      <div style={{ background: '#f0f2f5', padding: '10px 0', textAlign: 'center', marginBottom: 20 }}>
        <button style={{ margin: '0 12px' }} onClick={() => navigate('/customers')}>Customer Management</button>
        <button style={{ margin: '0 12px' }} onClick={() => navigate('/reservations')}>Reservation Management</button>
        <button style={{ margin: '0 12px' }} onClick={() => navigate('/orders')}>Order Management</button>
        <button onClick={handleLogout} style={{ marginLeft: 16, color: 'red' }}>Logout</button>
      </div>
      <h2>Reservation List</h2>
      <Link to="/reservations/add">Add Reservation</Link>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {reservations.map(r => (
          <li key={r.id}>
            <Link to={`/reservations/${r.id}`}>Reservation #{r.id} (Table: {r.diningTableId}, Customer: {r.customerId})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
