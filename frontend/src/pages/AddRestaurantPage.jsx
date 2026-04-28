import React, { useState } from 'react';
import { addRestaurant } from '../api/restaurant';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Space, Row, Col, Typography, Alert } from 'antd';

const { Title } = Typography;

export default function AddRestaurantPage() {
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const [fieldError, setFieldError] = useState({});
  const validate = () => {
    const fe = {};
    if (!form.name.trim()) fe.name = 'Name is required';
    if (!form.address.trim()) fe.address = 'Address is required';
    if (!form.phone.trim()) fe.phone = 'Phone is required';
    setFieldError(fe);
    return fe;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const fe = validate();
    if (Object.keys(fe).length > 0) {
      setLoading(false);
      return;
    }
    try {
      const res = await addRestaurant(form);
      if (res?.data?.id) {
        setSuccess(true);
        setError('');
        setForm({ name: '', address: '', phone: '' });
      } else {
        setError('Add failed');
      }
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
          <Title level={3} style={{ marginBottom: 24 }}>Add Restaurant</Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {success && <Alert type="success" message="Add successfully" showIcon />}
            {error && <Alert type="error" message={error} showIcon />}
            <form onSubmit={handleSubmit}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Name"
                  size="large"
                  status={fieldError.name ? 'error' : ''}
                />
                {fieldError.name && <div style={{ color: 'red' }}>{fieldError.name}</div>}
                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Address"
                  size="large"
                  status={fieldError.address ? 'error' : ''}
                />
                {fieldError.address && <div style={{ color: 'red' }}>{fieldError.address}</div>}
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  size="large"
                  status={fieldError.phone ? 'error' : ''}
                />
                {fieldError.phone && <div style={{ color: 'red' }}>{fieldError.phone}</div>}
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Add
                </Button>
                <Button block style={{ marginTop: 8 }} onClick={() => navigate('/restaurants')}>
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
