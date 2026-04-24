import React, { useState } from 'react';
import { Card, Button, Form, Input, message, Select } from 'antd';
import { register, login } from '../api/auth';
import { decodeJWT } from '../utils/jwt';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../slices/userSlice';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('USER');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(values);
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
        console.log('User roles:', roles);
        message.success('Login successful!');
        // ADMIN 登录后直接进入餐厅列表页（/restaurants），不再强制添加餐厅
        if (res.data.roles && res.data.roles.includes('ADMIN')) {
          navigate('/restaurants');
        } else {
          navigate('/orders');
        }
      } else {
        // Use selected role from form, fallback to 'USER'
        const role = values.role || 'USER';
        await register({ ...values, roles: [role] });
        message.success('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      if (isLogin && err?.response?.data?.message?.includes('already exists')) {
        message.info('User already registered, please login.');
        setIsLogin(true);
      } else {
        message.error(err?.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <Card title={isLogin ? 'Login' : 'Register'} style={{ width: 350 }}>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please input your username!' }]}> 
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }, { min: 6, message: 'Password must be at least 6 characters' }]}> 
            <Input.Password placeholder="Password" />
          </Form.Item>
          {!isLogin && (
            <>
              <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select a role!' }]}> 
                <Select
                  placeholder="Select a role"
                  value={selectedRole}
                  onChange={value => setSelectedRole(value)}
                >
                  <Select.Option value="USER">User</Select.Option>
                  <Select.Option value="ADMIN">Admin</Select.Option>
                </Select>
              </Form.Item>
              <div style={{ marginBottom: 16, color: '#555', textAlign: 'center' }}>
                Current selected role: <b>{selectedRole === 'ADMIN' ? 'Admin' : 'User'}</b>
              </div>
            </>
          )}
          <Button type="primary" htmlType="submit" loading={loading} block>
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </Form>
        <Button type="link" onClick={() => setIsLogin(!isLogin)} style={{ padding: 0, marginTop: 8 }}>
          {isLogin ? 'No account? Register' : 'Already registered? Login'}
        </Button>
      </Card>
    </div>
  );
}
