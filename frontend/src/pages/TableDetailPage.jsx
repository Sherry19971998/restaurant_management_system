import React, { useEffect, useState } from 'react';
import { getTable, updateTableStatus } from '../api/table';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Row, Col, Typography, Select, Space, message } from 'antd';
const { Title } = Typography;
const { Option } = Select;

export default function TableDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTable(id)
      .then(res => {
        setTable(res.data);
        setStatus(res.data.status);
      })
      .catch(() => setError('Failed to load table'));
  }, [id]);

  const handleStatusChange = e => setStatus(e.target.value);
  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'OCCUPIED', label: 'Occupied' },
    { value: 'RESERVED', label: 'Reserved' },
    { value: 'NEED_CLEANING', label: 'Need Cleaning' },
    { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
  ];

  const handleSelectChange = value => setStatus(value);

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      await updateTableStatus(id, { status });
      message.success('Status updated!');
    } catch {
      setError('Update failed');
      message.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!table) return <div>Loading...</div>;
  return (
    <Row justify="center" style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card
          style={{ borderRadius: 12, marginTop: 32 }}
          bordered={false}
          bodyStyle={{ padding: 32 }}
        >
          <Title level={3} style={{ marginBottom: 24 }}>Table #{table.tableNumber}</Title>
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ width: 120, fontWeight: 500 }}
            contentStyle={{ fontSize: 16 }}
          >
            <Descriptions.Item label="ID">{table.id}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Space>
                <Select
                  value={status}
                  onChange={handleSelectChange}
                  style={{ minWidth: 160 }}
                  disabled={loading}
                >
                  {statusOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
                <Button type="primary" onClick={handleUpdate} loading={loading}>
                  Update Status
                </Button>
              </Space>
            </Descriptions.Item>
          </Descriptions>
          <Button
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
