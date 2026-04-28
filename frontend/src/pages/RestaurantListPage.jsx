import React, { useEffect, useState } from 'react';
import { getRestaurants } from '../api/restaurant';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Space, Table, Typography, Empty } from 'antd';

const { Title } = Typography;

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getRestaurants()
      .then(res => setRestaurants(res.data || []))
      .catch(() => setError('Failed to load restaurants'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/restaurants/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/restaurants/${record.id}`)}>View</Button>
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
              title={<Title level={3} style={{ margin: 0 }}>Restaurant List</Title>}
              extra={
                <Button type="primary" onClick={() => navigate('/restaurants/add')}>
                  + Add Restaurant
                </Button>
              }
            >
              {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
              <Table
                rowKey="id"
                columns={columns}
                dataSource={restaurants}
                loading={loading}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: <Empty description="No restaurants found" /> }}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
