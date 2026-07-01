import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../utils/api';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const { adminToken } = useAdminAuth();

  const tabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

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

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update payment status');
      
      const updatedOrder = await res.json();
      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
    } catch (err) {
      console.error(err);
      alert('Error updating payment status');
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const filteredOrders = activeTab === 'All' ? orders : orders.filter(o => o.orderStatus === activeTab);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Orders Report - ${activeTab}`, 14, 15);
    
    const tableColumn = ["Order ID", "Date", "Customer", "Amount (Rs)", "Payment", "Status"];
    const tableRows = [];

    filteredOrders.forEach(order => {
      const orderData = [
        order._id,
        new Date(order.createdAt).toLocaleDateString(),
        order.customer?.name || 'N/A',
        order.totalAmount || 0,
        order.paymentStatus || 'N/A',
        order.orderStatus
      ];
      tableRows.push(orderData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    const date = new Date().toISOString().split('T')[0];
    doc.save(`orders_${activeTab.toLowerCase()}_${date}.pdf`);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-display">Orders Management</h1>
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] text-white text-sm font-semibold rounded-sm hover:bg-black/80 transition-colors"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-[#0d0d0d] text-[#0d0d0d]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab === 'Processing' ? 'Recent (Processing)' : tab}
          </button>
        ))}
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
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-gray-50 border-b">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-gray-500 mb-1">{order._id}</div>
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <button 
                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)} 
                        className="text-xs text-indigo-600 font-semibold underline mt-2"
                      >
                        {expandedOrderId === order._id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{order.customer?.name}</div>
                      <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">₹{order.totalAmount?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {order.paymentMethod === 'Razorpay' 
                          ? 'Online Payment' 
                          : order.paymentMethod === 'Cash on Delivery' 
                            ? 'Pay on Delivery' 
                            : order.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                        className={`border rounded px-2 py-1 text-xs font-bold outline-none cursor-pointer ${
                          order.paymentStatus === 'Paid' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm bg-white outline-none"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                  {expandedOrderId === order._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="px-6 py-6 border-b">
                        <div className="grid md:grid-cols-2 gap-8 bg-white p-5 rounded border shadow-sm">
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">Delivery Information</h4>
                            <p className="text-sm font-semibold mb-1">{order.customer?.name}</p>
                            <p className="text-sm text-gray-600">{order.deliveryAddress?.house}, {order.deliveryAddress?.street}</p>
                            <p className="text-sm text-gray-600">{order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.zip}</p>
                            <div className="mt-3 text-sm text-gray-600">
                              <p><span className="font-medium text-gray-800">Phone:</span> {order.customer?.phone}</p>
                              {order.customer?.email && <p><span className="font-medium text-gray-800">Email:</span> {order.customer?.email}</p>}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">Items Purchased</h4>
                            <ul className="space-y-3">
                              {order.items?.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0">
                                  <div className="flex gap-3">
                                    {item.image && (
                                      <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-sm border" />
                                    )}
                                    <div>
                                      <p className="text-sm font-semibold">{item.name}</p>
                                      <p className="text-xs text-gray-500">
                                        Qty: {item.quantity} {[item.size, item.color].filter(Boolean).join(' · ')}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
