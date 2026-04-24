import React, { useState } from 'react';
import { login } from '../api/auth';
import { Form, Input, Button, message, Card } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess } from '../slices/userSlice';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const res = await login(values);
      
      localStorage.setItem('token', res.data.token);

      dispatch(
        loginSuccess({
          user: {
            username: values.username,
            roles: res.data.roles || ['USER'],
          },
          token: res.data.token,
        })
      );

      message.success('Login successful!');
      navigate('/orders');
    } catch (err) {
      message.error(err.response?.data || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '40px',
        backgroundColor: '#ffffff',
      }}
    >
      <Card title="Login" style={{ width: 350 }}>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please input your username!' },
            ]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Login
            </Button>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/register">Register</Link>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}