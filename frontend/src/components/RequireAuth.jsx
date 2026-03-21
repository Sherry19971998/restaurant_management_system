import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children, roles }) {
  const user = useSelector(state => state.user.user);
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.some(r => user.roles.includes(r))) return <div>Permission Denied</div>;
  return children;
}
