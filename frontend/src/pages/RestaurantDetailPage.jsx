import React, { useEffect, useState } from 'react';
import { getRestaurant } from '../api/restaurant';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Row, Col, Typography } from 'antd';
const { Title } = Typography;

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getRestaurant(id)
      .then(res => setRestaurant(res.data))
      .catch(() => setError('Failed to load restaurant'));
  }, [id]);

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!restaurant) return <div>Loading...</div>;
  return (
    <Row justify="center" style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card
          style={{ borderRadius: 12, marginTop: 32 }}
          bordered={false}
          bodyStyle={{ padding: 32 }}
        >
          <Title level={3} style={{ marginBottom: 24 }}>{restaurant.name}</Title>
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ width: 120, fontWeight: 500 }}
            contentStyle={{ fontSize: 16 }}
          >
            <Descriptions.Item label="ID">{restaurant.id}</Descriptions.Item>
            <Descriptions.Item label="Address">{restaurant.address}</Descriptions.Item>
            <Descriptions.Item label="Phone">{restaurant.phone}</Descriptions.Item>
          </Descriptions>
          <Button
            type="primary"
            style={{ marginTop: 32, width: 120 }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Card>
      </Col>
    </Row>
  );
}
