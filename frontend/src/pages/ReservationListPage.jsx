

import { useNavigate, Link } from 'react-router-dom';
import { getReservations } from '../api/reservation';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Space, Table, Typography, Empty, Tag } from 'antd';
export default function ReservationListPage() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getReservations()
      .then(res => setReservations(res.data || []))
      .catch(() => setError('Failed to load reservations'))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = status => {
    switch (status) {
      case 'CONFIRMED': return 'green';
      case 'CANCELLED': return 'red';
      case 'COMPLETED': return 'blue';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Reservation #',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => <Link to={`/reservations/${id}`}>#{id}</Link>,
    },
    {
      title: 'Table',
      dataIndex: 'diningTableId',
      key: 'diningTableId',
    },
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customerId',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: val => val ? new Date(val).toLocaleString() : '',
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: val => val ? new Date(val).toLocaleString() : '',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => <Tag color={statusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/reservations/${record.id}`)}>View</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={24} md={23} lg={22} xl={20}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
              style={{ borderRadius: 12 }}
              title={<Typography.Title level={3} style={{ margin: 0 }}>Reservation List</Typography.Title>}
              extra={
                <Button type="primary" onClick={() => navigate('/reservations/add')}>
                  + Add Reservation
                </Button>
              }
            >
              {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
              <Table
                rowKey="id"
                columns={columns}
                dataSource={reservations}
                loading={loading}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: <Empty description="No reservations found" /> }}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
