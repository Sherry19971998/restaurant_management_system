import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';

export default function RequireAuth({ children, roles }) {
  const user = useSelector(state => state.user.user);
  const token = localStorage.getItem('token');
  if (!user && token) {
    // 正在自动登录，显示 loading
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><Spin size="large" tip="Restoring session..." /></div>;
  }
  if (!user && !token) return <Navigate to="/login" />;
  if (roles && !roles.some(r => user.roles.includes(r))) return <div>Permission Denied</div>;
  return children;
}
