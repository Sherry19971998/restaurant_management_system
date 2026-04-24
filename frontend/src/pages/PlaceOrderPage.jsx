import React, { useState, useEffect } from 'react';
import { placeOrder } from '../api/order';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PlaceOrderPage() {
  const customerId = useSelector(state => state.user.customerId);
  const reservationId = useSelector(state => state.user.reservationId);
  const [form, setForm] = useState({ diningTableId: '', customerId: '', reservationId: '', status: 'PLACED', items: [] });
  const [item, setItem] = useState({ menuItemId: '', quantity: '', priceAtOrder: '', note: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [fieldError, setFieldError] = useState({});
  const [itemError, setItemError] = useState('');
  const navigate = useNavigate();

  // Redirect to AddCustomerPage if no customerId
  useEffect(() => {
    if (!customerId) {
      navigate('/customers/add');
    } else if (!reservationId) {
      navigate('/reservations/add');
    } else {
      setForm(f => ({ ...f, customerId, reservationId }));
    }
    // eslint-disable-next-line
  }, [customerId, reservationId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleItemChange = e => setItem({ ...item, [e.target.name]: e.target.value });

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
      await placeOrder({ ...form, items });
      navigate('/orders');
    } catch (err) {
      setError(err?.response?.data?.message || 'Place order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Place Order</h2>
      <input name="diningTableId" value={form.diningTableId} onChange={handleChange} placeholder="Table ID" />
      {fieldError.diningTableId && <div style={{color:'red'}}>{fieldError.diningTableId}</div>}
      <input name="customerId" value={customerId || ''} disabled placeholder="Customer ID" />
      {fieldError.customerId && <div style={{color:'red'}}>{fieldError.customerId}</div>}
      <input name="reservationId" value={reservationId || ''} disabled placeholder="Reservation ID" />
      {fieldError.reservationId && <div style={{color:'red'}}>{fieldError.reservationId}</div>}
      <div>
        <h4>Add Item</h4>
        <input name="menuItemId" value={item.menuItemId} onChange={handleItemChange} placeholder="Menu Item ID" />
        <input name="quantity" type="number" value={item.quantity} onChange={handleItemChange} placeholder="Quantity" />
        <input name="priceAtOrder" type="number" value={item.priceAtOrder} onChange={handleItemChange} placeholder="Price" />
        <input name="note" value={item.note} onChange={handleItemChange} placeholder="Note" />
        <button type="button" onClick={addItem}>Add Item</button>
        {itemError && <div style={{color:'red'}}>{itemError}</div>}
      </div>
      <ul>
        {items.map((it, idx) => (
          <li key={idx}>{it.menuItemId} x {it.quantity} (${it.priceAtOrder}) {it.note}</li>
        ))}
      </ul>
      {fieldError.items && <div style={{color:'red'}}>{fieldError.items}</div>}
      <button type="submit" disabled={loading}>Place Order</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}

export default PlaceOrderPage;
