import React, { useEffect, useState, useCallback } from 'react';
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
  const [successMsg, setSuccessMsg] = useState('');
  const [payMsg, setPayMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [tableName, setTableName] = useState('');
  const [menuMap, setMenuMap] = useState({});
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  const loadOrder = useCallback(async () => {
    try {
      const res = await getOrder(id);
      setOrder(res.data);
      setStatus(res.data.status);
      if (res.data.diningTableId) {
        getTable(res.data.diningTableId)
          .then(tableRes => {
            const t = tableRes.data;
            setTableName(t.tableNumber ? `T${t.tableNumber}` : `T${t.id}`);
          })
          .catch(() => setTableName(`T${res.data.diningTableId}`));
      }
      if (Array.isArray(res.data.items)) {
        const menuIds = [...new Set(res.data.items.map(i => i.menuItemId))];
        const menuResults = await Promise.all(menuIds.map(mid => getMenuItem(mid).then(r => r.data).catch(() => null)));
        const menuMapObj = {};
        menuResults.forEach(mi => { if (mi) menuMapObj[mi.id] = mi; });
        setMenuMap(menuMapObj);
      }
      if (res.data.customerId) {
        getCustomer(res.data.customerId)
          .then(custRes => setCustomer(custRes.data))
          .catch(() => setCustomer(null));
      }
    } catch {
      setError('Failed to load order');
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = e => setStatus(e.target.value);

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
      setError(err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const calcTotal = () => {
    if (!order || !order.items) return 0;
    return order.items.reduce((sum, item) => {
      const mi = menuMap[item.menuItemId];
      const unitPrice = mi && mi.price ? parseFloat(mi.price) : (item.priceAtOrder ? parseFloat(item.priceAtOrder) / parseInt(item.quantity || 1) : 0);
      return sum + (unitPrice * parseInt(item.quantity || 0));
    }, 0);
  };

  const handlePay = async () => {
    setLoading(true);
    setPayMsg('');
    try {
      const amount = parseFloat(calcTotal().toFixed(2));
      await payOrder(id, { amount, paymentMethod });
      setPayMsg('Payment successful!');
      await loadOrder();
    } catch (err) {
      setPayMsg(err?.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div>
      <h2>Order #{order.id}</h2>

      {successMsg && <div>{successMsg}</div>}
      {error && <div style={{color:'red'}}>{error}</div>}

      {/* Status update (all transitions) */}
      <div style={{ marginBottom: 12 }}>
        <label>Change Status: </label>
        <select value={status} onChange={handleStatusChange}>
          <option value="DRAFT">DRAFT</option>
          <option value="PLACED">PLACED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="READY">READY</option>
          <option value="SERVED">SERVED</option>
          <option value="REQUESTED_CHECK">REQUESTED_CHECK</option>
          <option value="PAID">PAID</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <button onClick={() => handleUpdate()} disabled={loading} style={{ marginLeft: 8 }}>Update Status</button>
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
      {(order.status === 'REQUESTED_CHECK' || order.status === 'SERVED') && (
        <div>
          <label>Payment Method: </label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
          </select>
          <button onClick={handlePay} disabled={loading} style={{ marginLeft: 8 }}>Pay</button>
        </div>
      )}
      {payMsg && <div>{payMsg}</div>}
      <button style={{marginTop:16}} onClick={() => navigate('/orders')}>Back</button>
    </div>
  );
}
