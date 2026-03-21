import React, { useEffect, useState } from 'react';
import { getReservation } from '../api/reservation';
import { useParams } from 'react-router-dom';

export default function ReservationDetailPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getReservation(id)
      .then(res => setReservation(res.data))
      .catch(() => setError('Failed to load reservation'));
  }, [id]);

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!reservation) return <div>Loading...</div>;

  return (
    <div>
      <h2>Reservation #{reservation.id}</h2>
      <div>Table: {reservation.diningTableId}</div>
      <div>Customer: {reservation.customerId}</div>
      <div>Time: {reservation.reservationTime}</div>
      <div>Party Size: {reservation.partySize}</div>
      <div>Status: {reservation.status}</div>
    </div>
  );
}
