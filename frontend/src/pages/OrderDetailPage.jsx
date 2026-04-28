import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { getOrder, payOrder, updateOrderStatus } from '../api/order';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  InputNumber,
  List,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const paymentOptions = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Card', value: 'CARD' },
  { label: 'Mobile', value: 'MOBILE' },
];

function getStatusColor(status) {
  switch (status) {
    case 'PAID':
      return 'green';
    case 'SERVED':
    case 'REQUESTED_CHECK':
      return 'blue';
    case 'READY':
      return 'orange';
    case 'IN_PROGRESS':
      return 'purple';
    case 'PLACED':
      return 'default';
    default:
      return 'default';
  }
}

function formatMoney(value) {
  const numberValue = Number(value || 0);
  return `$${numberValue.toFixed(2)}`;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payMsg, setPayMsg] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const orderTotal = useMemo(() => {
    if (!order?.items) return 0;

    return order.items.reduce((total, item) => {
      const price = Number(item.priceAtOrder || item.price || item.menuItem?.price || 0);
      const quantity = Number(item.quantity || 0);
      return total + price * quantity;
    }, 0);
  }, [order]);

  const canPay = order && ['SERVED', 'REQUESTED_CHECK'].includes(order.status);
  const isPaid = order?.status === 'PAID';


  // 加载订单并同步状态
  const loadOrder = useCallback(async () => {
    try {
      const res = await getOrder(id);
      setOrder(res.data);
      setStatus(res.data.status);
    } catch {
      setError('Failed to load order. Please make sure you are logged in and the backend is running.');
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line
  }, [loadOrder]);

  useEffect(() => {
    if (order) {
      setAmount(Number(orderTotal.toFixed(2)));
    }
  }, [order, orderTotal]);

  // 订单状态修改逻辑
  const handleStatusChange = e => setStatus(e.target ? e.target.value : e);
  const handleUpdate = async (overrideStatus) => {
    const newStatus = overrideStatus || status;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateOrderStatus(id, { status: newStatus });
      setSuccessMsg(`Order status updated to ${newStatus}.`);
      await loadOrder();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Update failed';
      if (msg.includes('Order is in status CLOSED')) {
        setError('Cannot update status: This order is already closed.');
      } else if (msg.startsWith('Cannot transition from')) {
        // 提取 next status
        const match = msg.match(/Expected next status: ([A-Z_]+)/);
        const next = match ? match[1] : '';
        setError(next ? `Only allowed to move to next status: ${next}` : msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setPayMsg('');
    setError('');

    if (!canPay) {
      setPayMsg('Payment can only be completed after the order has been served or the check has been requested.');
      setLoading(false);
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setPayMsg('Please enter a valid payment amount.');
      setLoading(false);
      return;
    }

    if (Number(amount).toFixed(2) !== orderTotal.toFixed(2)) {
      setPayMsg(`Payment amount must match the order total of ${formatMoney(orderTotal)}.`);
      setLoading(false);
      return;
    }

    try {
      const res = await payOrder(id, {
        paymentMethod,
        amount: Number(amount),
      });

      setOrder(res.data);
      setPayMsg('Payment successful! Order marked as PAID.');
      message.success('Payment processed successfully.');
    } catch (err) {
      setPayMsg(err?.response?.data?.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerDisplay = () => {
    return (
      order?.customer?.name ||
      order?.customerName ||
      order?.customerId ||
      'Not available'
    );
  };

  const getTableDisplay = () => {
    return (
      order?.diningTable?.tableNumber ||
      order?.tableNumber ||
      order?.diningTableId ||
      'Not available'
    );
  };

  const getItemName = (item) => {
    if (item.menuItem?.name) return item.menuItem.name;
    if (item.menuItem?.id) return `Menu Item #${item.menuItem.id}`;
    if (item.menuItemId) return `Menu Item #${item.menuItemId}`;
    return 'Menu Item';
  };

  if (error && !order) {
    return (
      <div style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
        <Alert type="error" message="Order Error" description={error} showIcon />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
        <Card loading />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={24} md={22} lg={18} xl={16}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
              style={{ borderRadius: 12 }}
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Order #{order.id}</span>
                  <Tag color={getStatusColor(order.status)}>{order.status}</Tag>
                </Space>
              }
              extra={
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/orders')}
                >
                  Back to Order List
                </Button>
              }
            >
              {/* 订单状态修改区域 */}
              <div style={{ marginBottom: 24 }}>
                <label>Change Status: </label>
                <select value={status} onChange={handleStatusChange} style={{ minWidth: 160 }}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PLACED">PLACED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="READY">READY</option>
                  <option value="SERVED">SERVED</option>
                  <option value="REQUESTED_CHECK">REQUESTED_CHECK</option>
                  <option value="PAID">PAID</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
                <Button onClick={() => handleUpdate()} disabled={loading} style={{ marginLeft: 8 }}>Update Status</Button>
                {successMsg && <span style={{ color: 'green', marginLeft: 12 }}>{successMsg}</span>}
                {error && (
                  <div style={{ color: 'red', marginTop: 8, fontWeight: 500 }}>{error}</div>
                )}
              </div>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Order Total"
                    value={orderTotal}
                    precision={2}
                    prefix={<DollarOutlined />}
                  />
                </Col>

                <Col xs={24} md={16}>
                  <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Customer">
                      {getCustomerDisplay()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Table">
                      {getTableDisplay()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Current Status">
                      <Tag color={getStatusColor(order.status)}>{order.status}</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            <Card style={{ borderRadius: 12 }} title="Order Items">
              <List
                dataSource={order.items || []}
                locale={{ emptyText: 'No items found for this order.' }}
                renderItem={(item) => {
                  const price = Number(item.priceAtOrder || item.price || item.menuItem?.price || 0);
                  const quantity = Number(item.quantity || 0);
                  const subtotal = price * quantity;

                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={getItemName(item)}
                        description={
                          <Space direction="vertical" size={2}>
                            <Text>Quantity: {quantity}</Text>
                            <Text>Price: {formatMoney(price)}</Text>
                            {item.note && <Text type="secondary">Note: {item.note}</Text>}
                          </Space>
                        }
                      />
                      <Text strong>{formatMoney(subtotal)}</Text>
                    </List.Item>
                  );
                }}
              />
            </Card>

            <Card
              style={{ borderRadius: 12 }}
              title={
                <Space>
                  <CreditCardOutlined />
                  <span>Process Payment</span>
                </Space>
              }
            >
              {isPaid ? (
                <Alert
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  message="This order has already been paid."
                  description={
                    <Space direction="vertical">
                      <Text>Paid Amount: {formatMoney(order.paidAmount || orderTotal)}</Text>
                      <Text>Payment Method: {order.paymentMethod || paymentMethod}</Text>
                    </Space>
                  }
                />
              ) : (
                <>
                  {!canPay && (
                    <Alert
                      type="warning"
                      showIcon
                      style={{ marginBottom: 16 }}
                      message="Payment is not available yet."
                      description="Payment can be completed once the order has been served or the check has been requested."
                    />
                  )}

                  <Form layout="vertical">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item label="Payment Method" required>
                          <Select
                            value={paymentMethod}
                            onChange={setPaymentMethod}
                            options={paymentOptions}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item label="Amount" required>
                          <InputNumber
                            value={amount}
                            onChange={setAmount}
                            min={0}
                            step={0.01}
                            precision={2}
                            prefix="$"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Button
                      type="primary"
                      size="large"
                      icon={<DollarOutlined />}
                      loading={loading}
                      disabled={!canPay}
                      onClick={handlePay}
                    >
                      Pay Order
                    </Button>
                  </Form>
                </>
              )}

              {payMsg && (
                <Alert
                  style={{ marginTop: 16 }}
                  type={payMsg.includes('successful') ? 'success' : 'error'}
                  showIcon
                  message={payMsg}
                />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}