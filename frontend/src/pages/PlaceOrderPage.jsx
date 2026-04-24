import React, { useState, useEffect } from 'react';
import { placeOrder } from '../api/order';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCustomerByPhone } from '../api/customer';
import { getReservations, getReservation } from '../api/reservation';
import { getMenuItems } from '../api/menuItem';

function PlaceOrderPage() {
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
      // 获取所有菜单项
      getMenuItems().then(res => {
        setMenuItems(Array.isArray(res.data) ? res.data : []);
      }).catch(() => setMenuItems([]));
    }, []);
  const reservationId = useSelector(state => state.user.reservationId);
  const [customerId, setCustomerId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [form, setForm] = useState({ diningTableId: '', customerId: '', reservationId: '', status: 'PLACED', items: [] });
  const [item, setItem] = useState({ menuItemId: '', quantity: '', priceAtOrder: '', note: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [fieldError, setFieldError] = useState({});
  const [itemError, setItemError] = useState('');
  const navigate = useNavigate();

  // 只在页面初始时检查 reservationId，如果没有，则在手机号校验后判断是否需要跳转

  // 只要 customerId 变化就写入 form
  // 当有 customerId 和 reservationId 时，自动查找 reservation 并获取 table number
  useEffect(() => {
    if (customerId && reservationId) {
      setForm(f => ({ ...f, customerId, reservationId }));
      // 获取 reservation 详情，拿到 table number
      getReservation(reservationId)
        .then(res => {
          const r = res.data;
          if (r && r.diningTableId) {
            setForm(f => ({ ...f, diningTableId: r.diningTableId }));
            setTableNumber(r.diningTableId);
          }
        })
        .catch(() => setTableNumber(''));
    }
  }, [customerId, reservationId]);

  // 手机号校验并判断是否需要跳转预定
  const handleCheckPhone = async () => {
    setCheckingPhone(true);
    setError('');
    try {
      const res = await getCustomerByPhone(phone);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const foundCustomerId = res.data[0].id;
        setCustomerId(foundCustomerId);
        // 检查该 customer 是否已有 reservation
        const reservationsRes = await getReservations();
        const reservations = Array.isArray(reservationsRes.data) ? reservationsRes.data : [];
        const hasReservation = reservations.some(r => String(r.customerId) === String(foundCustomerId));
        if (!hasReservation) {
          navigate('/reservations/add');
        }
        // 如果有 reservationId，后续 useEffect 会自动写入 form
      } else {
        navigate('/customers/add');
      }
    } catch (err) {
      setError('Failed to check phone');
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  // 自动根据 menuItemId 填充价格，并根据数量自动算总价
  const handleItemChange = e => {
    const { name, value } = e.target;
    let newItem = { ...item, [name]: value };
    if (name === 'menuItemId') {
      const mi = menuItems.find(m => String(m.id) === String(value));
      if (mi) {
        newItem.priceAtOrder = mi.price && newItem.quantity ? (parseFloat(mi.price) * parseInt(newItem.quantity || 1)).toFixed(2) : mi.price;
      } else {
        newItem.priceAtOrder = '';
      }
    }
    if (name === 'quantity') {
      const mi = menuItems.find(m => String(m.id) === String(newItem.menuItemId));
      if (mi && value) {
        newItem.priceAtOrder = mi.price ? (parseFloat(mi.price) * parseInt(value)).toFixed(2) : '';
      }
    }
    setItem(newItem);
  };

  const validateItem = () => {
    if (!item.menuItemId.trim()) return 'Menu Item ID required';
    if (!item.quantity || isNaN(item.quantity) || parseInt(item.quantity) <= 0) return 'Quantity must be positive';
    if (!item.priceAtOrder || isNaN(item.priceAtOrder) || parseFloat(item.priceAtOrder) <= 0) return 'Price must be positive';
    return '';
  };

  const addItem = () => {
    const errMsg = validateItem();
    if (errMsg) {
      setItemError(errMsg);
      return;
    }
    setItems([...items, item]);
    setItem({ menuItemId: '', quantity: '', priceAtOrder: '', note: '' });
    setItemError('');
  };

  const validate = () => {
    const fe = {};
    if (!form.diningTableId.trim()) fe.diningTableId = 'Table ID required';
    if (!customerId) fe.customerId = 'Customer ID required';
    if (!reservationId) fe.reservationId = 'Reservation ID required';
    if (items.length === 0) fe.items = 'At least one item required';
    return fe;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fe = validate();
    setFieldError(fe);
    if (Object.keys(fe).length > 0) {
      setLoading(false);
      return;
    }
    try {
      // diningTableId 转为数字类型，避免后端 Long 解析错误
      const payload = {
        ...form,
        diningTableId: form.diningTableId ? Number(form.diningTableId) : '',
        items
      };
      const res = await placeOrder(payload);
      // 跳转到订单列表，并带上新订单id用于高亮或定位
      const newOrderId = res?.data?.id;
      navigate('/orders', { state: { newOrderId } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Place order failed');
    } finally {
      setLoading(false);
    }
  };

  // 如果还没 customerId，先输入手机号
  if (!customerId) {
    return (
      <div>
        <h2>Place Order</h2>
        <input
          name="phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Enter customer phone"
        />
        <button onClick={handleCheckPhone} disabled={checkingPhone || !phone.trim()}>
          {checkingPhone ? 'Checking...' : 'Check Phone'}
        </button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </div>
    );
  }

  return (
    <div>
      <h2>Place Order</h2>
      <div style={{marginBottom: '1em', border: '1px solid #ccc', padding: '1em', borderRadius: '6px'}}>
        <b>Menu Items</b>
        <table style={{width: '100%', marginTop: 8, marginBottom: 8, borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f5f5f5'}}>
              <th style={{border: '1px solid #ddd', padding: 4}}>ID</th>
              <th style={{border: '1px solid #ddd', padding: 4}}>Name</th>
              <th style={{border: '1px solid #ddd', padding: 4}}>Price</th>
              <th style={{border: '1px solid #ddd', padding: 4}}>Description</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(mi => (
              <tr key={mi.id}>
                <td style={{border: '1px solid #ddd', padding: 4}}>{mi.id}</td>
                <td style={{border: '1px solid #ddd', padding: 4}}>{mi.name}</td>
                <td style={{border: '1px solid #ddd', padding: 4}}>{mi.price}</td>
                <td style={{border: '1px solid #ddd', padding: 4}}>{mi.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={handleSubmit}>
      <div>
        <label><b>Table Number</b></label><br />
        <span>{tableNumber ? `T${tableNumber}` : ''}</span>
        {fieldError.diningTableId && <div style={{color:'red'}}>{fieldError.diningTableId}</div>}
      </div>
      <div>
        <label htmlFor="customerId"><b>Customer ID</b></label><br />
        <input id="customerId" name="customerId" value={customerId || ''} disabled placeholder="Customer ID" />
        {fieldError.customerId && <div style={{color:'red'}}>{fieldError.customerId}</div>}
      </div>
      <div>
        <label htmlFor="reservationId"><b>Reservation ID</b></label><br />
        <input id="reservationId" name="reservationId" value={reservationId || ''} disabled placeholder="Reservation ID" />
        {fieldError.reservationId && <div style={{color:'red'}}>{fieldError.reservationId}</div>}
      </div>
      <div style={{marginTop: '1em', marginBottom: '1em'}}>
        <h4>Add Item</h4>
        <label htmlFor="menuItemId"><b>Menu Item ID</b></label><br />
        <input id="menuItemId" name="menuItemId" value={item.menuItemId} onChange={handleItemChange} placeholder="e.g. 16" />
        <br />
        <label htmlFor="quantity"><b>Quantity</b></label><br />
        <input id="quantity" name="quantity" type="number" value={item.quantity} onChange={handleItemChange} placeholder="e.g. 1" />
        <br />
        <label htmlFor="priceAtOrder"><b>Price</b></label><br />
        <input id="priceAtOrder" name="priceAtOrder" type="number" value={item.priceAtOrder} readOnly placeholder="Auto-calculated" />
        <br />
        <label htmlFor="note"><b>Note</b></label><br />
        <input id="note" name="note" value={item.note} onChange={handleItemChange} placeholder="Optional note" />
        <br />
        <button type="button" onClick={addItem}>Add Item</button>
        {itemError && <div style={{color:'red'}}>{itemError}</div>}
      </div>
      <div>
        <b>Order Items</b>
        <ul>
          {items.map((it, idx) => (
            <li key={idx}>
              <span><b>Menu Item ID:</b> {it.menuItemId} </span>
              <span><b>Quantity:</b> {it.quantity} </span>
              <span><b>Price:</b> ${it.priceAtOrder} </span>
              {it.note && <span><b>Note:</b> {it.note}</span>}
            </li>
          ))}
        </ul>
        {fieldError.items && <div style={{color:'red'}}>{fieldError.items}</div>}
      </div>
      <button type="submit" disabled={loading}>Place Order</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
    </div>
  );
}

export default PlaceOrderPage;
