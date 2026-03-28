import React, { useEffect, useState } from 'react';
import { getTable, updateTableStatus } from '../api/table';
import { useParams } from 'react-router-dom';

export default function TableDetailPage() {
  const { id } = useParams();
  const [table, setTable] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTable(id)
      .then(res => {
        setTable(res.data);
        setStatus(res.data.status);
      })
      .catch(() => setError('Failed to load table'));
  }, [id]);

  const handleStatusChange = e => setStatus(e.target.value);

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      await updateTableStatus(id, { status });
      alert('Status updated!');
    } catch {
      setError('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!table) return <div>Loading...</div>;

  return (
    <div>
      <h2>Table #{table.tableNumber}</h2>
      <div>Status: 
        <select value={status} onChange={handleStatusChange}>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="OCCUPIED">OCCUPIED</option>
          <option value="RESERVED">RESERVED</option>
          <option value="NEEDS_CLEANING">NEEDS_CLEANING</option>
        </select>
        <button onClick={handleUpdate} disabled={loading}>Update Status</button>
      </div>
    </div>
  );
}
