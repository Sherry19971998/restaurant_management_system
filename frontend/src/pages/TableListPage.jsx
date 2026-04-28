import React, { useEffect, useState } from 'react';
import { getTables } from '../api/table';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Space, Table, Typography, Empty, Tag } from 'antd';

const { Title, Text } = Typography;

export default function TableListPage() {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getTables()
      .then(res => setTables(res.data || []))
      .catch(() => setError('Failed to load tables'))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = status => {
    switch (status) {
      case 'AVAILABLE': return 'green';
      case 'OCCUPIED': return 'red';
      case 'RESERVED': return 'blue';
      case 'OUT_OF_SERVICE': return 'orange';
      case 'NEED_CLEANING': return 'purple';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Table Number',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
      render: (text, record) => <Link to={`/tables/${record.id}`}>Table #{text}</Link>,
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => <Tag color={statusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Restaurant ID',
      dataIndex: 'restaurantId',
      key: 'restaurantId',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/tables/${record.id}`)}>View</Button>
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
              title={<Title level={3} style={{ margin: 0 }}>Dining Table List</Title>}
              extra={
                <Button type="primary" onClick={() => navigate('/tables/add')}>
                  + Add Table
                </Button>
              }
            >
              {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
              <Table
                rowKey="id"
                columns={columns}
                dataSource={tables}
                loading={loading}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: <Empty description="No tables found" /> }}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
