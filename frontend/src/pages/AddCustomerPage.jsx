
import React, { useState } from 'react';
import { addCustomer } from '../api/customer';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Space, Row, Col, Typography, Alert } from 'antd';

const { Title } = Typography;
import { useDispatch } from 'react-redux';
import { setCustomerId } from '../slices/userSlice';


export default function AddCustomerPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess('');
  };

  const validate = () => {
    const fe = {};

    if (!form.name.trim()) {
      fe.name = 'Name is required';
    }

    if (!form.phone.trim()) {
      fe.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(form.phone)) {
      fe.phone = 'Phone number must be exactly 10 digits';
    }

    if (!form.email.trim()) {
      fe.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      fe.email = 'Invalid email format';
    }
      return fe;
  };


  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const fe = validate();
    setFieldError(fe);

    if (Object.keys(fe).length > 0) {
      setLoading(false);
      return;
    }
    try {
      const res = await addCustomer(form);
      if (res?.data?.id) {
        setSuccess('Add successfully');
        setError('');
        setForm({ name: '', phone: '', email: '' });
        dispatch(setCustomerId(res.data.id));
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
          <Title level={3} style={{ marginBottom: 24 }}>Add Customer</Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {success && <Alert type="success" message={success} showIcon />}
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
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  size="large"
                  status={fieldError.phone ? 'error' : ''}
                />
                {fieldError.phone && <div style={{ color: 'red' }}>{fieldError.phone}</div>}
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  size="large"
                  status={fieldError.email ? 'error' : ''}
                />
                {fieldError.email && <div style={{ color: 'red' }}>{fieldError.email}</div>}
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Add
                </Button>
                <Button block style={{ marginTop: 8 }} onClick={() => navigate('/customers')}>
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
