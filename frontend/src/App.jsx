import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import store from './store';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <Provider store={store}>
      <ConfigProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
            <Route path="/customers" element={<RequireAuth roles={['ADMIN']}><CustomerListPage /></RequireAuth>} />
            <Route path="/customers/add" element={<RequireAuth roles={['ADMIN']}><AddCustomerPage /></RequireAuth>} />
            <Route path="/customers/:id" element={<RequireAuth roles={['ADMIN']}><CustomerDetailPage /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><OrderListPage /></RequireAuth>} />
            <Route path="/orders/place" element={<RequireAuth><PlaceOrderPage /></RequireAuth>} />
            <Route path="/orders/:id" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
            <Route path="/reservations" element={<RequireAuth><ReservationListPage /></RequireAuth>} />
            <Route path="/reservations/add" element={<RequireAuth><AddReservationPage /></RequireAuth>} />
            <Route path="/reservations/:id" element={<RequireAuth><ReservationDetailPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}
