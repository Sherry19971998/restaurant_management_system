import React, { useEffect, useState } from 'react';
import { getTables } from '../api/table';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Space } from 'antd';

export default function TableListPage() {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getTables()
      .then(res => setTables(res.data))
      .catch(() => setError('Failed to load tables'));
  }, []);

  const navigate = useNavigate();
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

      {/* 管理导航按钮组 */}
      <div style={{ marginTop: 32 }}>
        <h3>Admin Management</h3>
        <Space>
          <Button type="primary" onClick={() => navigate('/restaurants')}>餐厅管理</Button>
          <Button type="default" onClick={() => navigate('/tables')}>餐桌管理</Button>
          <Button type="primary" onClick={() => navigate('/menu-items')}>菜单管理</Button>
        </Space>
      </div>
    </div>
  );
}
