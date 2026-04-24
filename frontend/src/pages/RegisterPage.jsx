import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, adminRegister } from '../api/auth';
import { Card, Form, Input, Button, message, Radio } from 'antd';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [identity, setIdentity] = useState('user');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (identity === 'admin') {
        await adminRegister({ ...values, roles: ['ADMIN'] });
        message.success('Registration successful! Please login as admin.');
        navigate('/login?admin=1');
      } else {
        await register({ ...values, roles: ['USER'] });
        message.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <Card title="User Registration" style={{ width: 350 }}>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item label="Identity" name="identity" initialValue="user">
            <Radio.Group value={identity} onChange={e => setIdentity(e.target.value)}>
              <Radio value="user">User</Radio>
              <Radio value="admin">Admin</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please input your username!' }]}> 
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }, { min: 6, message: 'Password must be at least 6 characters' }]}> 
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form>
      </Card>
    </div>
  );
}
