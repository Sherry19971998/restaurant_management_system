import React, { useState } from 'react';
import { addReservation, getReservations } from '../api/reservation';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setReservationId } from '../slices/userSlice';
import { getCustomerByPhone } from '../api/customer';
import { getTable, getTables } from '../api/table';
import { Card, Input, InputNumber, Button, Select, Space, Row, Col, Typography, Alert } from 'antd';

const { Title } = Typography;

export default function AddReservationPage() {
  const [form, setForm] = useState({ startTime: '', endTime: '', partySize: '', status: 'CONFIRMED', diningTableId: '', customerId: '' });
  const [phone, setPhone] = useState('');
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [availableTables, setAvailableTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // 手机号查重
  const handleCheckPhone = async () => {
    setCheckingPhone(true);
    setError('');
    setAddSuccess(false);
    try {
      const res = await getCustomerByPhone(phone);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setForm(f => ({ ...f, customerId: res.data[0].id }));
        setError('');
      } else {
        setForm(f => ({ ...f, customerId: '' }));
        setError('No customer found for this phone. Please add customer first.');
      }
    } catch (err) {
      setError('Failed to check phone');
    } finally {
      setCheckingPhone(false);
    }
  };

  const validate = () => {
    const fe = {};
    if (!form.startTime.trim()) fe.startTime = 'Start time is required';
    else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(form.startTime)) fe.startTime = 'Invalid start datetime format';
    if (!form.endTime.trim()) fe.endTime = 'End time is required';
    else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(form.endTime)) fe.endTime = 'Invalid end datetime format';
    if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) fe.endTime = 'End time must be after start time';
    if (!form.partySize || isNaN(form.partySize) || parseInt(form.partySize) <= 0) fe.partySize = 'Party size must be positive';
    if (!String(form.customerId).trim()) fe.customerId = 'Customer ID is required';
    return fe;
  };

  // 查询可用桌子
  const fetchAvailableTables = async () => {
    setTablesLoading(true);
    setAvailableTables([]);
    setError('');
    try {
      const [tablesRes, reservationsRes] = await Promise.all([
        getTables(),
        getReservations()
      ]);
      const tables = tablesRes.data;
      const reservations = reservationsRes.data;
      const startTime = new Date(form.startTime);
      const endTime = new Date(form.endTime);
      const filtered = tables.filter(table => {
        // Only show AVAILABLE tables
        if (table.status !== 'AVAILABLE') return false;
        if (parseInt(form.partySize) > table.capacity) return false;
        const hasConflict = reservations.some(r => {
          if (r.diningTableId !== table.id) return false;
          const rStart = new Date(r.startTime || r.reservationTime);
          const rEnd = new Date(r.endTime || (rStart.getTime() + 60 * 60 * 1000));
          return (startTime < rEnd && endTime > rStart);
        });
        return !hasConflict;
      });
      setAvailableTables(filtered);
      if (filtered.length === 0) {
        setError('No available table for this time and party size.');
      }
    } catch (err) {
      setError('Failed to fetch available tables');
    } finally {
      setTablesLoading(false);
    }
  };

  // 提交时直接用用户选择的桌子
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fe = validate();
    setFieldError(fe);
    if (Object.keys(fe).length > 0) {
      setLoading(false);
      return;
    }
    try {
      const payload = { ...form };
      const res = await addReservation(payload);
      const reservationId = res?.data?.id;
      if (reservationId) {
        dispatch(setReservationId(reservationId));
        setAddSuccess(true);
        // 不自动跳转，留在页面
      } else {
        setError('Reservation created but no ID returned');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  // 表单顶部增加手机号查重
  return (
    <Row justify="center" style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card style={{ borderRadius: 12 }}>
          <Title level={3} style={{ marginBottom: 24 }}>Add Reservation</Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {addSuccess && <Alert type="success" message="Add successfully" showIcon />}
            {error && <Alert type="error" message={error} showIcon />}
            <form onSubmit={handleSubmit}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space direction="horizontal" style={{ width: '100%' }}>
                  <Input
                    name="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter customer phone for duplicate check"
                    size="large"
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="default"
                    onClick={handleCheckPhone}
                    loading={checkingPhone}
                    disabled={!phone.trim()}
                  >
                    Check Phone
                  </Button>
                </Space>
                <Input
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  placeholder="Start Time (YYYY-MM-DDTHH:mm:ss)"
                  size="large"
                  status={fieldError.startTime ? 'error' : ''}
                />
                {fieldError.startTime && <div style={{ color: 'red' }}>{fieldError.startTime}</div>}
                <Input
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  placeholder="End Time (YYYY-MM-DDTHH:mm:ss)"
                  size="large"
                  status={fieldError.endTime ? 'error' : ''}
                />
                {fieldError.endTime && <div style={{ color: 'red' }}>{fieldError.endTime}</div>}
                <InputNumber
                  name="partySize"
                  value={form.partySize}
                  onChange={val => setForm(f => ({ ...f, partySize: val }))}
                  placeholder="Party Size"
                  min={1}
                  style={{ width: '100%' }}
                  size="large"
                  status={fieldError.partySize ? 'error' : ''}
                />
                {fieldError.partySize && <div style={{ color: 'red' }}>{fieldError.partySize}</div>}
                <Space direction="horizontal" style={{ width: '100%' }}>
                  <Select
                    name="diningTableId"
                    value={form.diningTableId}
                    onChange={val => setForm(f => ({ ...f, diningTableId: val }))}
                    style={{ flex: 1 }}
                    size="large"
                    placeholder="Select Table"
                    loading={tablesLoading}
                    required
                  >
                    <Select.Option value="">-- Select Table --</Select.Option>
                    {availableTables.map(t => (
                      <Select.Option key={t.id} value={t.id}>{`T${t.tableNumber} (Capacity: ${t.capacity})`}</Select.Option>
                    ))}
                  </Select>
                  <Button
                    type="default"
                    onClick={fetchAvailableTables}
                    loading={tablesLoading}
                    disabled={!form.startTime || !form.endTime || !form.partySize}
                  >
                    Check Available
                  </Button>
                </Space>
                {fieldError.diningTableId && <div style={{ color: 'red' }}>{fieldError.diningTableId}</div>}
                <Input
                  name="customerId"
                  value={form.customerId}
                  disabled
                  placeholder="Customer ID"
                  size="large"
                  status={fieldError.customerId ? 'error' : ''}
                />
                {fieldError.customerId && <div style={{ color: 'red' }}>{fieldError.customerId}</div>}
                <Select
                  name="status"
                  value={form.status}
                  onChange={val => setForm(f => ({ ...f, status: val }))}
                  style={{ width: '100%' }}
                  size="large"
                  required
                >
                  <Select.Option value="CONFIRMED">CONFIRMED</Select.Option>
                  <Select.Option value="CANCELLED">CANCELLED</Select.Option>
                </Select>
                <Space direction="horizontal" style={{ width: '100%' }}>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    Add
                  </Button>
                  <Button block style={{ marginTop: 8 }} onClick={() => navigate('/reservations')}>
                    Back
                  </Button>
                </Space>
              </Space>
            </form>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}