import React, { useEffect, useState } from 'react';
import { getReservation, cancelReservation } from '../api/reservation';
import { getTable } from '../api/table';
import { getCustomer } from '../api/customer';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Row, Col, Space, Button, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function ReservationDetailPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');
  const [tableName, setTableName] = useState('');
  const [customer, setCustomer] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getReservation(id)
      .then(res => {
        setReservation(res.data);
        // Fetch table name if diningTableId exists
        if (res.data && res.data.diningTableId) {
          getTable(res.data.diningTableId)
            .then(tableRes => {
              const t = tableRes.data;
              setTableName(t.tableNumber ? `T${t.tableNumber}` : `T${t.id}`);
            })
            .catch(() => setTableName(`${res.data.diningTableId}`));
        }
        // Fetch customer info
        if (res.data && res.data.customerId) {
          getCustomer(res.data.customerId)
            .then(custRes => setCustomer(custRes.data))
            .catch(() => setCustomer(null));
        }
      })
      .catch(() => setError('Failed to load reservation'));
  }, [id]);

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!reservation) return <div>Loading...</div>;

  // 状态颜色
  const statusColor = {
    PENDING: 'gold',
    CONFIRMED: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
  }[reservation.status] || 'default';

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelError('');
    try {
      await cancelReservation(reservation.id);
      // 重新加载数据
      const res = await getReservation(reservation.id);
      setReservation(res.data);
    } catch (err) {
      setCancelError(err?.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ marginTop: 32 }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card
          title={<span style={{ fontWeight: 600 }}>Reservation Detail</span>}
          bordered={false}
          style={{ boxShadow: '0 2px 8px #f0f1f2', borderRadius: 12 }}
          extra={
            <Space>
              {(reservation.status === 'CONFIRMED' || reservation.status === 'PENDING') && (
                <Button danger loading={cancelLoading} onClick={handleCancel} disabled={cancelLoading}>
                  Cancel Reservation
                </Button>
              )}
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reservations')}>
                Back
              </Button>
            </Space>
          }
        >
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Reservation ID">{reservation.id}</Descriptions.Item>
            <Descriptions.Item label="Table">{tableName || `T${reservation.diningTableId}`}</Descriptions.Item>
            <Descriptions.Item label="Customer">
              {customer
                ? `${customer.name || ''} (ID: ${customer.id})${customer.phone ? ' / ' + customer.phone : ''}`
                : reservation.customerId}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {reservation.startTime && reservation.endTime
                ? `${reservation.startTime} ~ ${reservation.endTime}`
                : reservation.reservationTime || ''}
            </Descriptions.Item>
            <Descriptions.Item label="Party Size">{reservation.partySize}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColor}>{reservation.status}</Tag>
            </Descriptions.Item>
          </Descriptions>
          {cancelError && <div style={{ color: 'red', marginTop: 12 }}>{cancelError}</div>}
        </Card>
      </Col>
    </Row>
  );
}
