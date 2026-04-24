import React, { useEffect, useState } from 'react';
import { getOrder, updateOrderStatus, payOrder } from '../api/order';
import { getTable } from '../api/table';
import { getMenuItem } from '../api/menuItem';
import { getCustomer } from '../api/customer';
import { useParams, useNavigate } from 'react-router-dom';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [payMsg, setPayMsg] = useState('');
  const [tableName, setTableName] = useState('');
  const [menuMap, setMenuMap] = useState({});
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getOrder(id)
      .then(async res => {
        setOrder(res.data);
        setStatus(res.data.status);
        // Fetch table name if diningTableId exists
        if (res.data && res.data.diningTableId) {
          getTable(res.data.diningTableId)
            .then(tableRes => {
              const t = tableRes.data;
              setTableName(t.tableNumber ? `T${t.tableNumber}` : `T${t.id}`);
            })
            .catch(() => setTableName(`T${res.data.diningTableId}`));
        }
        // Fetch menu item details for all items
        if (res.data && Array.isArray(res.data.items)) {
          const menuIds = [...new Set(res.data.items.map(i => i.menuItemId))];
          const menuResults = await Promise.all(menuIds.map(id => getMenuItem(id).then(r => r.data).catch(() => null)));
          const menuMapObj = {};
          menuResults.forEach(mi => { if (mi) menuMapObj[mi.id] = mi; });
          setMenuMap(menuMapObj);
        }
        // Fetch customer info
        if (res.data && res.data.customerId) {
          getCustomer(res.data.customerId)
            .then(custRes => setCustomer(custRes.data))
            .catch(() => setCustomer(null));
        }
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
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed');
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
    } catch (err) {
      setPayMsg(err?.response?.data?.message || 'Payment failed');
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
      <div>Customer: {customer ? (customer.name ? `${customer.name} (ID: ${customer.id})` : `ID: ${customer.id}`) : order.customerId}</div>
      <div>Table: {tableName ? tableName : (order.diningTableId ? `T${order.diningTableId}` : '')}</div>
      <div>Items:
        <ul>
          {order.items && order.items.length > 0 ? order.items.map(item => {
            const mi = menuMap[item.menuItemId];
            let name = '';
            if (mi && mi.name) {
              name = mi.name;
            } else if (item.menuItemId) {
              name = `ID: ${item.menuItemId}`;
            } else {
              name = '(Unknown Item)';
            }
            const unitPrice = mi && mi.price ? parseFloat(mi.price) : (item.priceAtOrder ? parseFloat(item.priceAtOrder) / parseInt(item.quantity || 1) : 0);
            const quantity = parseInt(item.quantity) || 0;
            const subtotal = (unitPrice * quantity).toFixed(2);
            return (
              <li key={item.id}>
                <b>{name}</b>{item.menuItemId ? ` (ID: ${item.menuItemId})` : ''} x {quantity} @ ${unitPrice.toFixed(2)} = ${subtotal}
                {item.note && <span> — {item.note}</span>}
              </li>
            );
          }) : <li>No items</li>}
        </ul>
        {order.items && order.items.length > 0 && (
          <div style={{marginTop:8}}>
            <b>Total: $</b>{order.items.reduce((sum, item) => {
              const mi = menuMap[item.menuItemId];
              const unitPrice = mi && mi.price ? parseFloat(mi.price) : (item.priceAtOrder ? parseFloat(item.priceAtOrder) / parseInt(item.quantity || 1) : 0);
              const quantity = parseInt(item.quantity) || 0;
              return sum + (unitPrice * quantity);
            }, 0).toFixed(2)}
          </div>
        )}
      </div>
      <button onClick={handlePay} disabled={loading}>Pay</button>
      {payMsg && <div>{payMsg}</div>}
      <button style={{marginTop:16}} onClick={() => navigate('/orders')}>Back</button>
    </div>
  );
}
