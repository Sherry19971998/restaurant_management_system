

import React, { useState, useEffect } from 'react';
import { login, adminLogin } from '../api/auth';
import { decodeJWT } from '../utils/jwt';
import { Form, Input, Button, message, Card, Radio } from 'antd';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../slices/userSlice';
import { useNavigate } from 'react-router-dom';


export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [identity, setIdentity] = useState('user');
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 根据身份选择调用不同 API
      const res = identity === 'admin' ? await adminLogin(values) : await login(values);
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
      // 登录成功后跳转
      if (identity === 'user') {
        navigate('/customers');
      } else if (identity === 'admin') {
        navigate('/restaurants');
      }
    } catch (err) {
      let msg = 'Login failed';
      const data = err.response?.data;
      if (typeof data === 'string') {
        msg = data;
      } else if (data && typeof data.message === 'string') {
        msg = data.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (errorMsg) {
      message.error(errorMsg);
      setErrorMsg('');
    }
  }, [errorMsg]);

  return (
    <Card title="User Login" style={{ maxWidth: 350, margin: '40px auto' }}>
      <Form name="login" onFinish={onFinish} layout="vertical" autoComplete="off">
        <Form.Item name="identity" label="Identity" initialValue="user">
          <Radio.Group value={identity} onChange={e => setIdentity(e.target.value)}>
            <Radio value="user">User</Radio>
            <Radio value="admin">Admin</Radio>
          </Radio.Group>
        </Form.Item>
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
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        New user? <a href="/register">Register here</a>
      </div>
    </Card>
  );
}
