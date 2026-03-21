import React, { useEffect, useState } from 'react';
import { getTables } from '../api/table';
import { Link } from 'react-router-dom';

export default function TableListPage() {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getTables()
      .then(res => setTables(res.data))
      .catch(() => setError('Failed to load tables'));
  }, []);

  return (
    <div>
      <h2>Dining Table List</h2>
      <Link to="/tables/add">Add Table</Link>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {tables.map(t => (
          <li key={t.id}>
            <Link to={`/tables/${t.id}`}>Table #{t.tableNumber} (Status: {t.status})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
