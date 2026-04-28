import React, { useState, useEffect } from 'react';
import { placeOrder } from '../api/order';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCustomerByPhone } from '../api/customer';
import { getReservations, getReservation } from '../api/reservation';
import { getMenuItems } from '../api/menuItem';
import { Card, Input, InputNumber, Button, Space, Row, Col, Typography, Alert, Table, Form, Divider, message } from 'antd';
const { Title } = Typography;

function PlaceOrderPage() {
  const phoneRegex = /^\d{10}$/;
  const [phoneError, setPhoneError] = useState('');
  const phoneInputRef = React.useRef();
  const menuItemIdRef = React.useRef();
  const quantityInputRef = React.useRef();
            const navigate = useNavigate();
            // 页面加载时自动获取菜单项
                    useEffect(() => {
                      getMenuItems()
                        .then(res => {
                          if (Array.isArray(res.data)) {
                            setMenuItems(res.data);
                          } else {
                            setMenuItems([]);
                          }
                        })
                        .catch(() => setMenuItems([]));
                    }, []);
                // 自动根据 menuItemId 填充价格，并根据数量自动算总价
                const handleItemChange = e => {
                  const { name, value } = e.target;
                  let newItem = { ...item, [name]: value };
                  if (name === 'menuItemId') {
                    const mi = menuItems.find(m => String(m.id) === String(value));
                    if (mi) {
                      newItem.priceAtOrder = mi.price ? parseFloat(mi.price).toFixed(2) : '';
                    } else {
                      newItem.priceAtOrder = '';
                    }
                  }
                  if (name === 'quantity') {
                    newItem.quantity = value;
                    const mi = menuItems.find(m => String(m.id) === String(newItem.menuItemId));
                    if (mi) {
                      newItem.priceAtOrder = mi.price ? parseFloat(mi.price).toFixed(2) : '';
                    }
                  }
                  setItem(newItem);
                };
            // validateItem 校验添加的单个菜品
    const validateItem = () => {
      if (!item.menuItemId || !String(item.menuItemId).trim()) {
        menuItemIdRef.current?.focus();
        return 'Menu Item ID required';
      }
      if (!item.quantity || isNaN(item.quantity) || parseInt(item.quantity) < 1) {
        quantityInputRef.current?.focus();
        return 'Quantity must be 1-99';
      }
      if (parseInt(item.quantity) > 99) {
        quantityInputRef.current?.focus();
        return 'Quantity must be 1-99';
      }
      if (!item.priceAtOrder || isNaN(item.priceAtOrder) || parseFloat(item.priceAtOrder) <= 0) return 'Price must be positive';
      // 新增：校验库存
      const mi = menuItems.find(m => String(m.id) === String(item.menuItemId));
      const qtyNum = Number(item.quantity);
      const invNum = Number(mi && mi.inventory);
      if (mi && !isNaN(invNum)) {
        if (qtyNum > invNum) {
          quantityInputRef.current?.focus();
          return `Menu item '${mi.name}' does not have enough inventory (remaining: ${invNum})`;
        }
      }
      return '';
    };

            // 添加菜品到订单
    const addItem = () => {
      const errMsg = validateItem();
      if (errMsg) {
        setItemError(errMsg);
        return;
      }
      setItems([...items, { ...item, quantity: parseInt(item.quantity) }]);
      setItem({ menuItemId: '', quantity: '', priceAtOrder: '', note: '' });
      setItemError('');
    };

            // 校验整个订单表单
    const validate = () => {
      const fe = {};
      if (!String(form.diningTableId || '').trim()) fe.diningTableId = 'Table ID required';
      if (!customerId) fe.customerId = 'Customer ID required';
      if (!reservationId) fe.reservationId = 'Reservation ID required';
      if (items.length === 0) fe.items = 'At least one item required';
      // 校验所有商品数量>0且<=99
      let totalQty = 0;
      let totalPrice = 0;
      for (const it of items) {
        const qty = parseInt(it.quantity);
        const price = parseFloat(it.priceAtOrder);
        if (isNaN(qty) || qty < 1 || qty > 99) fe.items = 'Each item quantity must be 1-99';
        totalQty += qty;
        totalPrice += isNaN(price) ? 0 : price * qty;
      }
      if (totalQty === 0) fe.items = 'Total quantity must be > 0';
      if (totalPrice <= 0) fe.items = 'Total price must be > 0';
      return fe;
    };
        // 自动根据 menuItemId 填充价格，并根据数量自动算总价
        // ...重复 handleItemChange 已移除...
    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState('');
    const [phone, setPhone] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [reservationId, setReservationId] = useState('');
    const [form, setForm] = useState({ diningTableId: '', customerId: '', reservationId: '', status: 'PLACED', items: [] });
    const [item, setItem] = useState({ menuItemId: '', quantity: '', priceAtOrder: '', note: '' });
    const [items, setItems] = useState([]);
    const [itemError, setItemError] = useState('');
    const [fieldError, setFieldError] = useState({});
    const [loading, setLoading] = useState(false);
    const [checkingPhone, setCheckingPhone] = useState(false);


    // 适配 antd Form 的 onFinish
    const handleSubmit = async () => {
      setLoading(true);
      setError('');
      const fe = validate();
      setFieldError(fe);
      if (Object.keys(fe).length > 0) {
        // 自动聚焦第一个未通过校验的输入项
        if (fe.items) {
          menuItemIdRef.current?.focus();
        } else if (fe.diningTableId) {
          // 无需聚焦，表单只读
        } else if (fe.customerId) {
          phoneInputRef.current?.focus();
        }
        setLoading(false);
        return;
      }
      try {
        // diningTableId 转为数字类型，避免后端 Long 解析错误
        const payload = {
          ...form,
          diningTableId: form.diningTableId ? Number(form.diningTableId) : '',
          customerId,
          reservationId,
          items
        };
        const res = await placeOrder(payload);
        // 跳转到订单列表，并带上新订单id用于高亮或定位
        const newOrderId = res?.data?.id;
        message.success('Order placed successfully!');
        navigate('/orders', { state: { newOrderId } });
      } catch (err) {
        setError(err?.response?.data?.message || 'Place order failed');
      } finally {
        setLoading(false);
      }
    };

    // 修复：将 handleCheckPhone 函数移到组件体内
    const handleCheckPhone = async () => {
      setCheckingPhone(true);
      setError('');
      setPhoneError('');
      if (!phoneRegex.test(phone)) {
        setPhoneError('Phone must be 10 digits');
        phoneInputRef.current?.focus();
        setCheckingPhone(false);
        return;
      }
      try {
        const res = await getCustomerByPhone(phone);
        if (Array.isArray(res.data) && res.data.length > 0) {
          const foundCustomerId = res.data[0].id;
          setCustomerId(foundCustomerId);
          // 查找该 customer 的 reservation
          const reservationsRes = await getReservations();
          const reservations = Array.isArray(reservationsRes.data) ? reservationsRes.data : [];
          const customerReservation = reservations.find(r => String(r.customerId) === String(foundCustomerId));
          if (customerReservation) {
            setReservationId(customerReservation.id);
            setForm(f => ({
              ...f,
              reservationId: customerReservation.id,
              diningTableId: customerReservation.diningTableId || ''
            }));
          } else {
            navigate('/reservations/add');
            return;
          }
        } else {
          setError('No customer found for this phone number');
        }
      } catch (err) {
        setError('Failed to check phone');
      } finally {
        setCheckingPhone(false);
      }
    };

    return (
      <div style={{ padding: 24, background: '#f5f7fb', minHeight: '100vh' }}>
        <Row justify="center">
          <Col xs={24} sm={24} md={23} lg={22} xl={20}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card style={{ borderRadius: 12 }}>
                <Title level={3} style={{ marginBottom: 24 }}>Place Order</Title>
                <Form layout="vertical" onFinish={handleSubmit}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {error && <Alert type="error" message={error} showIcon />}
                  <Form.Item label="Phone Number" required>
                    <Space direction="horizontal" style={{ width: '100%' }}>
                      <Input
                        name="phone"
                        value={phone}
                        onChange={e => {
                          setPhone(e.target.value);
                          setPhoneError('');
                        }}
                        placeholder="Enter customer phone for duplicate check"
                        size="large"
                        style={{ flex: 1 }}
                        ref={phoneInputRef}
                        maxLength={10}
                        status={phoneError ? 'error' : ''}
                      />
                      <Button
                        type="default"
                        onClick={handleCheckPhone}
                        loading={checkingPhone}
                        disabled={!phone.trim() || !!phoneError}
                      >
                        Check Phone
                      </Button>
                                      {phoneError && <div style={{ color: 'red', marginTop: 4 }}>{phoneError}</div>}
                    </Space>
                  </Form.Item>
                  <Row gutter={12} style={{ marginBottom: 8 }}>
                    <Col xs={24} sm={8} md={8} lg={6} xl={6}>
                      <Form.Item label="Customer ID" style={{ marginBottom: 0 }}>
                        <Input
                          name="customerId"
                          value={customerId || ''}
                          disabled
                          placeholder="Customer ID"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8} md={8} lg={6} xl={6}>
                      <Form.Item label="Reservation ID" style={{ marginBottom: 0 }}>
                        <Input
                          name="reservationId"
                          value={reservationId || ''}
                          disabled
                          placeholder="Reservation ID"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8} md={8} lg={6} xl={6}>
                      <Form.Item label="Table ID" style={{ marginBottom: 0 }}>
                        <Input
                          name="diningTableId"
                          value={form.diningTableId || ''}
                          disabled
                          placeholder="Table ID"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider>Menu Items</Divider>
                  <Table
                    dataSource={menuItems}
                    columns={[
                      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
                      { title: 'Name', dataIndex: 'name', key: 'name', width: 180 },
                      { title: 'Price', dataIndex: 'price', key: 'price', width: 100, render: v => `$${Number(v).toFixed(2)}` },
                      { title: 'Description', dataIndex: 'description', key: 'description' },
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    style={{ marginBottom: 16 }}
                    scroll={{ x: '100%' }}
                  />
                  <Divider>Add Item</Divider>
                  <Card size="small" style={{ marginBottom: 12, background: '#fafbfc', borderRadius: 8, boxShadow: '0 1px 4px #f0f1f2' }} bodyStyle={{ padding: 12 }}>
                    <Row gutter={12} align="middle">
                      <Col flex="120px">
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>Menu Item ID</div>
                        <Input
                          name="menuItemId"
                          value={item.menuItemId}
                          onChange={handleItemChange}
                          placeholder="Menu Item ID"
                          ref={menuItemIdRef}
                        />
                      </Col>
                      <Col flex="200px">
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>Product Name</div>
                        <Input
                          name="productName"
                          value={(() => {
                            const mi = menuItems.find(m => String(m.id) === String(item.menuItemId));
                            return mi ? mi.name : '';
                          })()}
                          readOnly
                          placeholder="Auto-filled"
                          style={{ background: '#fafafa' }}
                        />
                      </Col>
                      <Col flex="100px">
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>Quantity</div>
                        <InputNumber
                          name="quantity"
                          value={item.quantity}
                          onChange={val => handleItemChange({ target: { name: 'quantity', value: val } })}
                          placeholder="Quantity"
                          min={1}
                          max={99}
                          style={{ width: '100%' }}
                          ref={quantityInputRef}
                        />
                      </Col>
                      <Col flex="120px">
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>Price</div>
                        <Input
                          name="priceAtOrder"
                          value={item.priceAtOrder}
                          readOnly
                          placeholder="Auto-calculated"
                          style={{ background: '#fafafa' }}
                        />
                      </Col>
                      <Col flex="180px">
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>Note</div>
                        <Input
                          name="note"
                          value={item.note}
                          onChange={handleItemChange}
                          placeholder="Note"
                        />
                      </Col>
                      <Col flex="100px" style={{ display: 'flex', alignItems: 'end', height: '100%', justifyContent: 'center' }}>
                        <Button type="primary" onClick={addItem} style={{ width: 96, marginTop: 22 }}>Add Item</Button>
                      </Col>
                    </Row>
                  </Card>
                  {itemError && <div style={{ color: 'red', marginBottom: 8 }}>{itemError}</div>}
                  <Divider>Order Items</Divider>
                  <Table
                    dataSource={items.map((it, idx) => {
                      const mi = menuItems.find(m => String(m.id) === String(it.menuItemId));
                      const price = Number(it.priceAtOrder);
                      const qty = Number(it.quantity);
                      return {
                        key: idx,
                        name: mi ? `${mi.name} (ID: ${mi.id})` : it.menuItemId,
                        quantity: qty,
                        unitPrice: `$${price.toFixed(2)}`,
                        subtotal: `$${(price * qty).toFixed(2)}`,
                        note: it.note || '',
                        idx,
                      };
                    })}
                    columns={[
                      { title: 'Menu Item', dataIndex: 'name', key: 'name' },
                      { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 90 },
                      { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
                      { title: 'Subtotal', dataIndex: 'subtotal', key: 'subtotal', width: 100 },
                      { title: 'Note', dataIndex: 'note', key: 'note', width: 180 },
                      {
                        title: 'Action',
                        key: 'action',
                        width: 80,
                        render: (_, record) => (
                          <Button danger size="small" onClick={() => {
                            setItems(items => items.filter((_, i) => i !== record.idx));
                          }}>Delete</Button>
                        ),
                      },
                    ]}
                    pagination={false}
                    size="small"
                    style={{ marginBottom: 0 }}
                  />
                  {fieldError.items && <div style={{ color: 'red', marginBottom: 8 }}>{fieldError.items}</div>}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      disabled={
                        loading ||
                        !phone ||
                        !!phoneError ||
                        !customerId ||
                        !reservationId ||
                        !form.diningTableId ||
                        items.length === 0 ||
                        Object.keys(fieldError).length > 0
                      }
                    >
                      Place Order
                    </Button>
                    <Button type="default" onClick={() => navigate('/orders')}>Back</Button>
                  </div>
                  </Space>
                </Form>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    );
}

export default PlaceOrderPage;
