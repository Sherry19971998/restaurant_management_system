import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RestaurantListPage from './pages/RestaurantListPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import AddRestaurantPage from './pages/AddRestaurantPage';
import TableListPage from './pages/TableListPage';
import TableDetailPage from './pages/TableDetailPage';
import AddTablePage from './pages/AddTablePage';
import MenuItemListPage from './pages/MenuItemListPage';
import MenuItemDetailPage from './pages/MenuItemDetailPage';
import AddEditMenuItemPage from './pages/AddEditMenuItemPage';
import CustomerListPage from './pages/CustomerListPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import AddCustomerPage from './pages/AddCustomerPage';
import OrderListPage from './pages/OrderListPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import ReservationListPage from './pages/ReservationListPage';
import ReservationDetailPage from './pages/ReservationDetailPage';
import AddReservationPage from './pages/AddReservationPage';
import 'antd/dist/reset.css';


import { ConfigProvider } from 'antd';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import RequireAuth from './components/RequireAuth';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';




function AdminNavBar() {
  const user = useSelector(state => state.user.user);
  const navigate = useNavigate();
  if (!user || !user.roles || !user.roles.includes('ADMIN')) return null;
  return (
    <div style={{ background: '#f0f2f5', padding: '8px 0', textAlign: 'center', color: '#333', fontWeight: 500, marginBottom: 12 }}>
      <span style={{ marginRight: 16 }}>管理导航：</span>
      <button onClick={() => navigate('/restaurants')} style={{ marginRight: 8 }}>餐厅管理</button>
      <button onClick={() => navigate('/tables')} style={{ marginRight: 8 }}>餐桌管理</button>
      <button onClick={() => navigate('/menu-items')} style={{ marginRight: 8 }}>菜单管理</button>
      <button onClick={() => navigate('/customers')} style={{ marginRight: 8 }}>用户管理</button>
      <button onClick={() => navigate('/orders')} style={{ marginRight: 8 }}>订单管理</button>
      <button onClick={() => navigate('/reservations')}>预定管理</button>
    </div>
  );
}

function RoleBanner() {
  const user = useSelector(state => state.user.user);
  if (!user || !user.roles) return null;
  return (
    <div style={{ background: '#f0f2f5', padding: '8px 0', textAlign: 'center', color: '#333', fontWeight: 500 }}>
      Current role: <b>{user.roles.includes('ADMIN') ? 'Admin' : 'User'}</b>
    </div>
  );
}

// Enforce business flow: after login, if USER and no customerId, redirect to /customers/add
function BusinessFlowEnforcer({ children }) {
  const user = useSelector(state => state.user.user);
  const customerId = useSelector(state => state.user.customerId);
  const reservationId = useSelector(state => state.user.reservationId);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // ADMIN 访问用户业务页面时强制跳转到管理页面
    if (user && user.roles && user.roles.includes('ADMIN')) {
      const userPages = [
        '/orders', '/orders/place', '/orders/', '/orders/add',
        '/reservations/add', '/reservations', '/place-order', '/add-customer', '/add-reservation', '/customer-list', '/reservation-list', '/order-list', '/order-detail', '/customer-detail', '/reservation-detail', '/placeorder', '/addcustomer', '/addreservation'
      ];
      if (userPages.some(p => location.pathname.startsWith(p))) {
        // 登录后跳转到餐厅管理
        navigate('/restaurants', { replace: true });
      }
    } else if (
      user &&
      user.roles &&
      user.roles.includes('USER') &&
      !user.roles.includes('ADMIN')
    ) {
      if (!customerId &&
        location.pathname !== '/customers/add' &&
        location.pathname !== '/logout' &&
        location.pathname !== '/login' &&
        location.pathname !== '/register' &&
        location.pathname !== '/auth') {
        navigate('/customers/add');
      } else if (customerId && !reservationId &&
        location.pathname !== '/reservations/add' &&
        location.pathname !== '/customers/add' &&
        location.pathname !== '/logout' &&
        location.pathname !== '/login' &&
        location.pathname !== '/register' &&
        location.pathname !== '/auth') {
        navigate('/reservations/add');
      }
    }
  }, [user, customerId, reservationId, location.pathname, navigate]);
  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <ConfigProvider>
        <Router>
          <RoleBanner />
          <AdminNavBar />
          <BusinessFlowEnforcer>
            <Routes>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/restaurants" element={<RequireAuth><RestaurantListPage /></RequireAuth>} />
              <Route path="/restaurants/add" element={<RequireAuth roles={['ADMIN']}><AddRestaurantPage /></RequireAuth>} />
              <Route path="/restaurants/:id" element={<RequireAuth><RestaurantDetailPage /></RequireAuth>} />
              <Route path="/tables" element={<RequireAuth><TableListPage /></RequireAuth>} />
              <Route path="/tables/add" element={<RequireAuth roles={['ADMIN']}><AddTablePage /></RequireAuth>} />
              <Route path="/tables/:id" element={<RequireAuth><TableDetailPage /></RequireAuth>} />
              <Route path="/menu-items" element={<RequireAuth><MenuItemListPage /></RequireAuth>} />
              <Route path="/menu-items/add" element={<RequireAuth roles={['ADMIN']}><AddEditMenuItemPage /></RequireAuth>} />
              <Route path="/menu-items/edit/:id" element={<RequireAuth roles={['ADMIN']}><AddEditMenuItemPage /></RequireAuth>} />
              <Route path="/menu-items/:id" element={<RequireAuth><MenuItemDetailPage /></RequireAuth>} />
              <Route path="/customers" element={<RequireAuth roles={['ADMIN']}><CustomerListPage /></RequireAuth>} />
              <Route path="/customers/add" element={<AddCustomerPage />} />
              <Route path="/customers/:id" element={<RequireAuth roles={['ADMIN']}><CustomerDetailPage /></RequireAuth>} />
              <Route path="/orders" element={<RequireAuth><OrderListPage /></RequireAuth>} />
              <Route path="/orders/place" element={<RequireAuth><PlaceOrderPage /></RequireAuth>} />
              <Route path="/orders/:id" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
              <Route path="/reservations" element={<RequireAuth><ReservationListPage /></RequireAuth>} />
              <Route path="/reservations/add" element={<RequireAuth><AddReservationPage /></RequireAuth>} />
              <Route path="/reservations/:id" element={<RequireAuth><ReservationDetailPage /></RequireAuth>} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </Routes>
          </BusinessFlowEnforcer>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}
