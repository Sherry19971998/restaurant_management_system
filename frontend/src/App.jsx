import React, { useEffect } from 'react';
import { Layout, Menu, Button, ConfigProvider } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
import store from './store';
import RequireAuth from './components/RequireAuth';
import { getProfile } from './api/user';
import { loginSuccess } from './slices/userSlice';
function UserNavBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  if (!user || !user.roles || !user.roles.includes('USER')) return null;
  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'user/logout' });
    navigate('/login');
  };
  // Highlight menu based on path
  const location = useLocation();
  let selectedKey = '';
  if (location.pathname.startsWith('/customers')) selectedKey = 'customers';
  else if (location.pathname.startsWith('/reservations')) selectedKey = 'reservations';
  else if (location.pathname.startsWith('/orders')) selectedKey = 'orders';

  const menuItems = [
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: 'Customer Management',
      onClick: () => navigate('/customers'),
    },
    {
      key: 'reservations',
      icon: <CalendarOutlined />,
      label: 'Reservation Management',
      onClick: () => navigate('/reservations'),
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'Order Management',
      onClick: () => navigate('/orders'),
    },
  ];
  return (
    <Layout.Header style={{ background: '#fff', padding: 0, marginBottom: 16, boxShadow: '0 2px 8px #f0f1f2', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: 1200, margin: '0 auto', height: 64 }}>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{ flex: 1, fontSize: 16, borderBottom: 'none', background: 'transparent' }}
          items={menuItems}
        />
        <Button
          type="text"
          icon={<LogoutOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />}
          onClick={handleLogout}
          style={{ marginLeft: 16, color: '#ff4d4f', fontWeight: 500 }}
        >
          Logout
        </Button>
      </div>
    </Layout.Header>
  );
}

function AdminNavBar() {
  const user = useSelector(state => state.user.user);
  const navigate = useNavigate();
  if (!user || !user.roles || !user.roles.includes('ADMIN')) return null;
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  // Highlight menu based on path
  const location = useLocation();
  let selectedKey = '';
  if (location.pathname.startsWith('/restaurants')) selectedKey = 'restaurants';
  else if (location.pathname.startsWith('/tables')) selectedKey = 'tables';
  else if (location.pathname.startsWith('/menu-items')) selectedKey = 'menu-items';

  const menuItems = [
    {
      key: 'restaurants',
      icon: <UserOutlined />,
      label: 'Restaurant Management',
      onClick: () => navigate('/restaurants'),
    },
    {
      key: 'tables',
      icon: <CalendarOutlined />,
      label: 'Table Management',
      onClick: () => navigate('/tables'),
    },
    {
      key: 'menu-items',
      icon: <ShoppingCartOutlined />,
      label: 'Menu Management',
      onClick: () => navigate('/menu-items'),
    },
  ];
  return (
    <Layout.Header style={{ background: '#fff', padding: 0, marginBottom: 16, boxShadow: '0 2px 8px #f0f1f2', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: 1200, margin: '0 auto', height: 64 }}>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{ flex: 1, fontSize: 16, borderBottom: 'none', background: 'transparent' }}
          items={menuItems}
        />
        <Button
          type="text"
          icon={<LogoutOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />}
          onClick={handleLogout}
          style={{ marginLeft: 16, color: '#ff4d4f', fontWeight: 500 }}
        >
          Logout
        </Button>
      </div>
    </Layout.Header>
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
    // Force redirect ADMIN to admin page when accessing user business pages
    if (user && user.roles && user.roles.includes('ADMIN')) {
      const userPages = [
        '/orders', '/orders/place', '/orders/', '/orders/add',
        '/reservations/add', '/reservations', '/place-order', '/add-customer', '/add-reservation', '/customer-list', '/reservation-list', '/order-list', '/order-detail', '/customer-detail', '/reservation-detail', '/placeorder', '/addcustomer', '/addreservation'
      ];
      if (userPages.some(p => location.pathname.startsWith(p))) {
        // Redirect to restaurant management after login
        navigate('/restaurants', { replace: true });
      }
    } else if (
      user &&
      user.roles &&
      user.roles.includes('USER') &&
      !user.roles.includes('ADMIN')
    ) {
      // Only force redirect on first login or when customerId is missing, allow free switching between main business pages
      // 支持详情页（/customers/:id, /reservations/:id, /orders/:id）
      const allowedUserPages = [
        '/customers', '/customers/add', '/reservations', '/reservations/add', '/orders', '/orders/place'
      ];
      const allowedDetailPatterns = [
        /^\/customers\/\d+$/, /^\/reservations\/\d+$/, /^\/orders\/\d+$/
      ];
      const isAllowed = allowedUserPages.includes(location.pathname) ||
        allowedDetailPatterns.some(re => re.test(location.pathname));
      if (!customerId && !isAllowed) {
        navigate('/customers');
      } else if (customerId && !reservationId && !isAllowed) {
        navigate('/reservations/add');
      }
    }
  }, [user, customerId, reservationId, location.pathname, navigate]);
  return children;
}

function AutoLogin({ children }) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      getProfile()
        .then(res => {
          if (res.data) {
            dispatch(loginSuccess({ user: res.data, token }));
          }
        })
        .catch(() => {
          // token 失效，清理
          localStorage.removeItem('token');
        });
    }
  }, [user, dispatch]);
  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <ConfigProvider>
        <Router>
          <AutoLogin>
            <RouteAwareHeader>
              <BusinessFlowEnforcer>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
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
                  <Route path="/customers" element={<RequireAuth roles={['USER', 'ADMIN']}><CustomerListPage /></RequireAuth>} />
                  <Route path="/customers/add" element={<AddCustomerPage />} />
                  <Route path="/customers/:id" element={<RequireAuth roles={['USER', 'ADMIN']}><CustomerDetailPage /></RequireAuth>} />
                  <Route path="/orders" element={<RequireAuth><OrderListPage /></RequireAuth>} />
                  <Route path="/orders/place" element={<RequireAuth><PlaceOrderPage /></RequireAuth>} />
                  <Route path="/orders/:id" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
                  <Route path="/reservations" element={<RequireAuth><ReservationListPage /></RequireAuth>} />
                  <Route path="/reservations/add" element={<RequireAuth><AddReservationPage /></RequireAuth>} />
                  <Route path="/reservations/:id" element={<RequireAuth><ReservationDetailPage /></RequireAuth>} />
                  <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
              </BusinessFlowEnforcer>
            </RouteAwareHeader>
          </AutoLogin>
        </Router>
      </ConfigProvider>
    </Provider>
  );

// This component shows RoleBanner and AdminNavBar only on non-auth pages
function RouteAwareHeader({ children }) {
  const location = useLocation();
  const hideHeader = ['/login', '/register', '/auth', '/forgot-password', '/reset-password'].includes(location.pathname);
  // 显示用户导航栏的页面
  const showUserNavBar =
    !hideHeader &&
    (
      location.pathname.startsWith('/customers') ||
      location.pathname.startsWith('/reservations') ||
      location.pathname.startsWith('/orders')
    );
  return (
    <>
      {!hideHeader && <RoleBanner />}
      {!hideHeader && <AdminNavBar />}
      {showUserNavBar && <UserNavBar />}
      {children}
    </>
  );
}
}
