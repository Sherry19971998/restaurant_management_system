import React, { useState } from 'react';
import { login } from '../api/auth';
import { decodeJWT } from '../utils/jwt';
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
      // 自动解码 JWT，提取 roles
      let roles = ['USER'];
      if (res.data.token) {
        const payload = decodeJWT(res.data.token);
        if (payload && payload.roles) roles = payload.roles;
      }
      dispatch(loginSuccess({
        user: { username: values.username, roles },
        token: res.data.token,
      }));
      // 主动保存 token 到 localStorage，供 axiosInstance 使用
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
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
            <Input placeholder="Username" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password placeholder="Password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Login
        </Button>
      </Form>
    </Card>
  );
}
