
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

      {/* Admin nav */}
      <div style={{ marginTop: 32 }}>
        <h3>Admin Management</h3>
        <Space>
          <Button type="primary" onClick={() => navigate('/restaurants')}>Restaurant Management</Button>
          <Button type="primary" onClick={() => navigate('/tables')}>Table Management</Button>
          <Button type="default" onClick={() => navigate('/menu-items')}>Menu Management</Button>
        </Space>
      </div>
    </div>
  );
}