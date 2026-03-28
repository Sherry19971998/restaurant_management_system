import React, { useState } from 'react';
import { placeOrder } from '../api/order';
import { useNavigate } from 'react-router-dom';

export default function PlaceOrderPage() {
  const [form, setForm] = useState({ diningTableId: '', customerId: '', status: 'PLACED', items: [] });
  const [item, setItem] = useState({ menuItemId: '', quantity: '', priceAtOrder: '', note: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleItemChange = e => setItem({ ...item, [e.target.name]: e.target.value });

  const addItem = () => {
    setItems([...items, item]);
    setItem({ menuItemId: '', quantity: '', priceAtOrder: '', note: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await placeOrder({ ...form, items });
      navigate('/orders');
    } catch (err) {
      setError('Place order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Place Order</h2>
      <input name="diningTableId" value={form.diningTableId} onChange={handleChange} placeholder="Table ID" required />
      <input name="customerId" value={form.customerId} onChange={handleChange} placeholder="Customer ID" required />
      <div>
        <h4>Add Item</h4>
        <input name="menuItemId" value={item.menuItemId} onChange={handleItemChange} placeholder="Menu Item ID" required />
        <input name="quantity" type="number" value={item.quantity} onChange={handleItemChange} placeholder="Quantity" required />
        <input name="priceAtOrder" type="number" value={item.priceAtOrder} onChange={handleItemChange} placeholder="Price" required />
        <input name="note" value={item.note} onChange={handleItemChange} placeholder="Note" />
        <button type="button" onClick={addItem}>Add Item</button>
      </div>
      <ul>
        {items.map((it, idx) => (
          <li key={idx}>{it.menuItemId} x {it.quantity} (${it.priceAtOrder}) {it.note}</li>
        ))}
      </ul>
      <button type="submit" disabled={loading}>Place Order</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
