import React, { useEffect, useState } from 'react';
import { getOrder, updateOrderStatus, payOrder } from '../api/order';
import { useParams } from 'react-router-dom';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [payMsg, setPayMsg] = useState('');

  useEffect(() => {
    getOrder(id)
      .then(res => {
        setOrder(res.data);
        setStatus(res.data.status);
      })
      .catch(() => setError('Failed to load order'));
  }, [id]);

  const handleStatusChange = e => setStatus(e.target.value);

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      await updateOrderStatus(id, { status });
      alert('Status updated!');
    } catch {
      setError('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setPayMsg('');
    try {
      await payOrder(id, {});
      setPayMsg('Payment successful!');
    } catch {
      setPayMsg('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!order) return <div>Loading...</div>;

  return (
    <div>
      <h2>Order #{order.id}</h2>
      <div>Status: 
        <select value={status} onChange={handleStatusChange}>
          <option value="PLACED">PLACED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="READY">READY</option>
          <option value="SERVED">SERVED</option>
          <option value="REQUESTED_CHECK">REQUESTED_CHECK</option>
          <option value="PAID">PAID</option>
        </select>
        <button onClick={handleUpdate} disabled={loading}>Update Status</button>
      </div>
      <div>Customer: {order.customerId}</div>
      <div>Table: {order.diningTableId}</div>
      <div>Items:
        <ul>
          {order.items && order.items.map(item => (
            <li key={item.id}>{item.menuItemId} x {item.quantity} (${item.priceAtOrder})</li>
          ))}
        </ul>
      </div>
      <button onClick={handlePay} disabled={loading}>Pay</button>
      {payMsg && <div>{payMsg}</div>}
    </div>
  );
}
