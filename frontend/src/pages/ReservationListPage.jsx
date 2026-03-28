import React, { useEffect, useState } from 'react';
import { getReservations } from '../api/reservation';
import { Link } from 'react-router-dom';

export default function ReservationListPage() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getReservations()
      .then(res => setReservations(res.data))
      .catch(() => setError('Failed to load reservations'));
  }, []);

  return (
    <div>
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
