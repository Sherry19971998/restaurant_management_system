import React, { useEffect, useState } from 'react';
import { getCustomer } from '../api/customer';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Typography, Space, Descriptions, Alert } from 'antd';

const { Title } = Typography;

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getCustomer(id)
      .then(res => setCustomer(res.data))
      .catch(() => setError('Failed to load customer'));
  }, [id]);

  return (
    <Row justify="center" style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card style={{ borderRadius: 12 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {error && <Alert type="error" message={error} showIcon />}
            {!customer ? (
              <div>Loading...</div>
            ) : (
              <>
                <Title level={3} style={{ marginBottom: 24 }}>{customer.name}</Title>
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="Customer ID">{customer.id}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{customer.phone}</Descriptions.Item>
                  <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
                </Descriptions>
                <Button block style={{ marginTop: 16 }} onClick={() => navigate('/customers')}>
                  Back
                </Button>
              </>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
