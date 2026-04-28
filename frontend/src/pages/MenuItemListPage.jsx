
import React, { useEffect, useState } from 'react';
import { getMenuItems } from '../api/menuItem';
import { useNavigate } from 'react-router-dom';
import { Button, Select, Space } from 'antd';

const { Option } = Select;

export default function MenuItemListPage() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getMenuItems()
      .then(res => setItems(res.data))
      .catch(() => setError('Failed to load menu items'));
  }, []);

  const handleEdit = () => {
    if (selectedId) {
      navigate(`/menu-items/edit/${selectedId}`);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Menu Items</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}


      {/* Menu item table */}
      <div style={{ marginBottom: 32 }}>
        <h3>All Menu Items</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Description</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Price</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Available</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Restaurant ID</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.name}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.description}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.price}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.available ? 'Yes' : 'No'}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.restaurant?.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit existing item */}
      <div style={{ marginBottom: 16 }}>
        <h3>Edit Existing Item</h3>
        <Space>
          <Select
            style={{ width: 300 }}
            placeholder="Select a menu item to edit"
            onChange={val => setSelectedId(val)}
            value={selectedId}
          >
            {items.map(item => (
              <Option key={item.id} value={item.id}>
                {item.name} (${item.price})
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={handleEdit}
            disabled={!selectedId}
          >
            Edit Selected Item
          </Button>
        </Space>
      </div>

      {/* Add new item */}
      <div style={{ marginBottom: 32 }}>
        <h3>Add New Item</h3>
        <Button type="primary" onClick={() => navigate('/menu-items/add')}>
          + Add New Menu Item
        </Button>
      </div>

      {/* Admin nav removed for this page */}
    </div>
  );
}