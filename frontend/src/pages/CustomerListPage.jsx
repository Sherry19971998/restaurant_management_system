import { Link } from 'react-router-dom';
import { Row, Col, Space, Card, Typography, Button, Table, Empty } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../api/customer';
export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getCustomers()
      .then(res => {
        if (Array.isArray(res.data)) {
          setCustomers(res.data);
        } else if (res.data && res.data.message) {
          setError(res.data.message);
        } else {
          setError('Failed to load customers');
        }
      })
      .catch(() => setError('Failed to load customers'))
      .finally(() => setLoading(false));
  }, []);

  // 手机号格式化函数
  function formatPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return digits; // 直接返回10位数字，无分隔符
    }
    return phone;
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text, record) => <span>{record.id}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/customers/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => formatPhone(text),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/customers/${record.id}`)}>View</Button>
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
              title={<Typography.Title level={3} style={{ margin: 0 }}>Customer List</Typography.Title>}
              extra={
                <Button type="primary" onClick={() => navigate('/customers/add')}>
                  + Add Customer
                </Button>
              }
            >
              {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
              <Table
                rowKey="id"
                columns={columns}
                dataSource={customers}
                loading={loading}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: <Empty description="No customers found" /> }}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
// removed extra closing brace
}
