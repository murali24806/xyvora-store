import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { adminToken } = useAdminAuth();

  useEffect(() => {
    fetchOrders();
  }, [adminToken]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError('Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      const updatedOrder = await res.json();
      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
    } catch (err) {
      console.error(err);
      alert('Error updating order status');
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-display">Orders Management</h1>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Order ID & Date</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Customer</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Amount & Method</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Payment Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Order Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-gray-500 mb-1">{order._id}</div>
                    <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{order.customer?.name}</div>
                    <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">₹{order.totalAmount?.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm bg-white"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
