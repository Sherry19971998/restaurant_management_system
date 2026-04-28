import React, { useState } from 'react';
import { addTable } from '../api/table';
import { useNavigate } from 'react-router-dom';
import { Card, Input, InputNumber, Button, Select, Space, Row, Col, Typography, Alert } from 'antd';

const { Title } = Typography;
const { Option } = Select;

export default function AddTablePage() {
  const [form, setForm] = useState({ tableNumber: '', capacity: '', status: 'AVAILABLE', restaurantId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const fe = {};
    if (!form.tableNumber.trim()) fe.tableNumber = 'Table number is required';
    if (!form.capacity || isNaN(form.capacity) || parseInt(form.capacity) <= 0) fe.capacity = 'Capacity must be positive';
    if (!form.restaurantId.trim()) fe.restaurantId = 'Restaurant ID is required';
    return fe;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const fe = validate();
    setFieldError(fe);
    if (Object.keys(fe).length > 0) {
      setLoading(false);
      return;
    }
    try {
      await addTable(form);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card style={{ borderRadius: 12 }}>
          <Title level={3} style={{ marginBottom: 24 }}>Add Table</Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {success && <Alert type="success" message="Add successfully" showIcon />}
            {error && <Alert type="error" message={error} showIcon />}
            <form onSubmit={handleSubmit}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Input
                  name="tableNumber"
                  value={form.tableNumber}
                  onChange={handleChange}
                  placeholder="Table Number"
                  size="large"
                  status={fieldError.tableNumber ? 'error' : ''}
                />
                {fieldError.tableNumber && <div style={{ color: 'red' }}>{fieldError.tableNumber}</div>}
                <InputNumber
                  name="capacity"
                  value={form.capacity}
                  onChange={val => setForm(f => ({ ...f, capacity: val }))}
                  placeholder="Capacity"
                  min={1}
                  style={{ width: '100%' }}
                  size="large"
                  status={fieldError.capacity ? 'error' : ''}
                />
                {fieldError.capacity && <div style={{ color: 'red' }}>{fieldError.capacity}</div>}
                <Input
                  name="restaurantId"
                  value={form.restaurantId}
                  onChange={handleChange}
                  placeholder="Restaurant ID"
                  size="large"
                  status={fieldError.restaurantId ? 'error' : ''}
                />
                {fieldError.restaurantId && <div style={{ color: 'red' }}>{fieldError.restaurantId}</div>}
                <Select
                  name="status"
                  value={form.status}
                  onChange={val => setForm(f => ({ ...f, status: val }))}
                  style={{ width: '100%' }}
                  size="large"
                  required
                >
                  <Option value="AVAILABLE">AVAILABLE</Option>
                  <Option value="OCCUPIED">OCCUPIED</Option>
                  <Option value="RESERVED">RESERVED</Option>
                  <Option value="OUT_OF_SERVICE">OUT_OF_SERVICE</Option>
                  <Option value="NEED_CLEANING">NEED_CLEANING</Option>
                </Select>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Add
                </Button>
                <Button block style={{ marginTop: 8 }} onClick={() => navigate('/tables')}>
                  Back
                </Button>
              </Space>
            </form>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
