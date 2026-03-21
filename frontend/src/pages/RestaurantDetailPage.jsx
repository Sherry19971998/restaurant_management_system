import React, { useEffect, useState } from 'react';
import { getRestaurant } from '../api/restaurant';
import { useParams } from 'react-router-dom';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getRestaurant(id)
      .then(res => setRestaurant(res.data))
      .catch(() => setError('Failed to load restaurant'));
  }, [id]);

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!restaurant) return <div>Loading...</div>;

  return (
    <div>
      <h2>{restaurant.name}</h2>
      <div>Address: {restaurant.address}</div>
      <div>Phone: {restaurant.phone}</div>
    </div>
  );
}
