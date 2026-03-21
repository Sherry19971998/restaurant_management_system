import React, { useEffect, useState } from 'react';
import { getRestaurants } from '../api/restaurant';
import { Link } from 'react-router-dom';

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getRestaurants()
      .then(res => setRestaurants(res.data))
      .catch(err => setError('Failed to load restaurants'));
  }, []);

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
    </div>
  );
}
