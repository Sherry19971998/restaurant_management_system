import React, { useEffect, useState } from 'react';
import { getReservation } from '../api/reservation';
import { getTable } from '../api/table';
import { useParams, useNavigate } from 'react-router-dom';

export default function ReservationDetailPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');
  const [tableName, setTableName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getReservation(id)
      .then(res => {
        setReservation(res.data);
        // Fetch table name if diningTableId exists
        if (res.data && res.data.diningTableId) {
          getTable(res.data.diningTableId)
            .then(tableRes => {
              // Always show as T{tableNumber} (e.g., T3)
              const t = tableRes.data;
              setTableName(t.tableNumber ? `T${t.tableNumber}` : `T${t.id}`);
            })
            .catch(() => setTableName(`${res.data.diningTableId}`));
        }
      })
      .catch(() => setError('Failed to load reservation'));
  }, [id]);

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!reservation) return <div>Loading...</div>;

  return (
    <div style={{display:'flex', flexDirection:'column', maxWidth:400, margin:'0 auto', gap:12}}>
      <h2>Reservation Detail</h2>
      <div><b>Reservation ID:</b> {reservation.id}</div>
      <div>Table: {tableName || `T${reservation.diningTableId}`}</div>
      <div>Customer: {reservation.customerId}</div>
      <div>
        Time: {reservation.startTime && reservation.endTime
          ? `${reservation.startTime} ~ ${reservation.endTime}`
          : reservation.reservationTime || ''}
      </div>
      <div>Party Size: {reservation.partySize}</div>
      <div>Status: {reservation.status}</div>
      <button style={{marginTop:16}} onClick={() => navigate('/reservations')}>Back</button>
    </div>
  );
}
