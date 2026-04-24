import React, { useEffect, useState } from 'react';
import { getRestaurants } from '../api/restaurant';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Space } from 'antd';

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getRestaurants()
      .then(res => setRestaurants(res.data))
      .catch(err => setError('Failed to load restaurants'));
  }, []);

  const navigate = useNavigate();
  return (
    <div>
      <h2>Restaurant List</h2>
      <Link to="/restaurants/add">Add Restaurant</Link>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {restaurants.map(r => (
          <li key={r.id}>
            <Link to={`/restaurants/${r.id}`}>{r.name}</Link>
          </li>
        ))}
      </ul>

      {/* Admin navigation removed as now in App.jsx */}
    </div>
  );
}
