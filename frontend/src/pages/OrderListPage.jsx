import React, { useEffect, useMemo, useState } from 'react';
import { getOrders } from '../api/order';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

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

function calculateOrderTotal(order) {
  if (!order?.items) return 0;

  return order.items.reduce((total, item) => {
    const price = Number(item.priceAtOrder || item.price || item.menuItem?.price || 0);
    const quantity = Number(item.quantity || 0);
    return total + price * quantity;
  }, 0);
}

function getCustomerDisplay(order) {
  return (
    order?.customer?.name ||
    order?.customerName ||
    order?.customerId ||
    'Not available'
  );
}

function getTableDisplay(order) {
  return (
    order?.diningTable?.tableNumber ||
    order?.tableNumber ||
    order?.diningTableId ||
    'Not available'
  );
}

function getOrderItemSummary(order) {
  if (!order?.items || order.items.length === 0) {
    return 'No items';
  }

  const firstItem = order.items[0];
  const firstItemName =
    firstItem.menuItem?.name ||
    firstItem.menuItemName ||
    firstItem.name ||
    `Menu Item #${firstItem.menuItem?.id || firstItem.menuItemId || ''}`;

  if (order.items.length === 1) {
    return `${firstItemName} x ${firstItem.quantity}`;
  }

  return `${firstItemName} + ${order.items.length - 1} more`;
}

function isPayable(status) {
  return ['SERVED', 'REQUESTED_CHECK'].includes(status);
}

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    setError('');

    getOrders()
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch(() => {
        setError('Failed to load orders. Please make sure you are logged in and the backend services are running.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((order) => order.status === 'PAID').length;
    const payableOrders = orders.filter((order) => isPayable(order.status)).length;
    const unpaidTotal = orders
      .filter((order) => order.status !== 'PAID')
      .reduce((total, order) => total + calculateOrderTotal(order), 0);

    return {
      totalOrders,
      paidOrders,
      payableOrders,
      unpaidTotal,
    };
  }, [orders]);

  const columns = [
    {
      title: 'Order',
      dataIndex: 'id',
      key: 'id',
      render: (id, order) => (
        <Space direction="vertical" size={0}>
          <Text strong>Order #{id}</Text>
          <Text type="secondary">
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'No date available'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, order) => getCustomerDisplay(order),
    },
    {
      title: 'Table',
      key: 'table',
      render: (_, order) => getTableDisplay(order),
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, order) => getOrderItemSummary(order),
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, order) => <Text strong>{formatMoney(calculateOrderTotal(order))}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Payment State',
      key: 'paymentState',
      render: (_, order) => {
        if (order.status === 'PAID') {
          return (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Paid
            </Tag>
          );
        }

        if (isPayable(order.status)) {
          return (
            <Tag color="blue" icon={<CreditCardOutlined />}>
              Ready for Payment
            </Tag>
          );
        }

        return (
          <Tag icon={<ClockCircleOutlined />}>
            Not Ready
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, order) => (
        <Link to={`/orders/${order.id}`}>
          <Button type={isPayable(order.status) ? 'primary' : 'default'} icon={<EyeOutlined />}>
            View / Pay
          </Button>
        </Link>
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
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Restaurant Orders</span>
                </Space>
              }
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={loadOrders} loading={loading}>
                    Refresh
                  </Button>
                  <Link to="/orders/place">
                    <Button type="primary" icon={<PlusOutlined />}>
                      Place Order
                    </Button>
                  </Link>
                </Space>
              }
            >
              <Title level={3} style={{ marginTop: 0 }}>
                Order List
              </Title>

              {error && (
                <Alert
                  type="error"
                  showIcon
                  message="Order Load Error"
                  description={error}
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Total Orders"
                    value={summary.totalOrders}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Ready for Payment"
                    value={summary.payableOrders}
                    prefix={<CreditCardOutlined />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Paid Orders"
                    value={summary.paidOrders}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Card style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Unpaid Total"
                    value={summary.unpaidTotal}
                    precision={2}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card style={{ borderRadius: 12 }}>
              {orders.length === 0 && !loading ? (
                <Empty
                  description="No orders found. Create or refresh orders to test UC6."
                />
              ) : (
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={orders}
                  loading={loading}
                  pagination={{ pageSize: 6 }}
                  scroll={{ x: 1000 }}
                />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}