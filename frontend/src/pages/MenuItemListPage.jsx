import React, { useEffect, useState } from 'react';
import { getMenuItems } from '../api/menuItem';
import { Link } from 'react-router-dom';

export default function MenuItemListPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getMenuItems()
      .then(res => setItems(res.data))
      .catch(() => setError('Failed to load menu items'));
  }, []);

  return (
    <div>
      <h2>Menu Item List</h2>
      <Link to="/menu-items/add">Add Menu Item</Link>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {items.map(i => (
          <li key={i.id}>
            <Link to={`/menu-items/${i.id}`}>{i.name} (${i.price})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
