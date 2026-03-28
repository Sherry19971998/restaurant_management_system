import React, { useEffect, useState } from 'react';
import { getMenuItem } from '../api/menuItem';
import { useParams, Link } from 'react-router-dom';

export default function MenuItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMenuItem(id)
      .then(res => setItem(res.data))
      .catch(() => setError('Failed to load menu item'));
  }, [id]);

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!item) return <div>Loading...</div>;

  return (
    <div>
      <h2>{item.name}</h2>
      <div>Description: {item.description}</div>
      <div>Price: ${item.price}</div>
      <div>Available: {item.available ? 'Yes' : 'No'}</div>
      <div>Restaurant ID: {item.restaurantId}</div>
      <Link to={`/menu-items/edit/${item.id}`}>Edit</Link>
    </div>
  );
}
