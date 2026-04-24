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

      {/* 管理导航按钮组 */}
      <div style={{ marginTop: 32 }}>
        <h3>Admin Management</h3>
        <Space>
          <Button type="default" onClick={() => navigate('/restaurants')}>餐厅管理</Button>
          <Button type="primary" onClick={() => navigate('/tables')}>餐桌管理</Button>
          <Button type="primary" onClick={() => navigate('/menu-items')}>菜单管理</Button>
        </Space>
      </div>
    </div>
  );
}
