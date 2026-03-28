import React, { useState } from 'react';
import { login } from '../api/auth';
import { Form, Input, Button, message, Card } from 'antd';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../slices/userSlice';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);
      // 假设后端返回 { token, roles, username }
      dispatch(loginSuccess({
        user: { username: values.username, roles: res.data.roles || ['USER'] },
        token: res.data.token,
      }));
      message.success('Login successful!');
    } catch (err) {
      message.error(err.response?.data || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Login" style={{ maxWidth: 350, margin: '40px auto' }}>
      <Form name="login" onFinish={onFinish} layout="vertical" autoComplete="off">
        <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please input your username!' }]}>

        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input your password!' }]}>

        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Login
        </Button>
      </Form>
    </Card>
  );
}
