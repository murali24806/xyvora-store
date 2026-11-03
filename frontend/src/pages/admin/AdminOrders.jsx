import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../utils/api';
import { Download, ShoppingBag, ChevronDown, ChevronUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
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
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
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
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-[#0d0d0d] mb-1">Orders</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Manage customer orders, update tracking statuses and export summaries.</p>
        </div>

        <button
          onClick={exportPDF}
          disabled={filteredOrders.length === 0}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#0d0d0d] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-black/80 active:scale-95 transition-all disabled:opacity-50"
        >
          <Download size={16} />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Responsive Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-200 mb-6 pb-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab 
                ? 'border-[#0d0d0d] text-[#0d0d0d] bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab === 'Processing' ? 'Recent (Processing)' : tab}
            <span className="ml-1.5 text-[11px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600">
              {tab === 'All' ? orders.length : orders.filter(o => o.orderStatus === tab).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 sm:p-12 text-center text-gray-400 border border-black/5">
          Loading orders...
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-black/5">
          <ShoppingBag size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} orders found</p>
          <p className="text-gray-400 text-xs mt-1">Orders placed by customers will show up here.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Order ID & Date</th>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Customer</th>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Amount & Method</th>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Payment Status</th>
                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-mono text-xs text-gray-600 font-semibold mb-0.5">#{order._id.slice(-6)}</div>
                          <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                          <button 
                            onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)} 
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline mt-2 flex items-center gap-1"
                          >
                            <span>{expandedOrderId === order._id ? 'Hide Details' : 'View Details'}</span>
                            {expandedOrderId === order._id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-sm text-[#0d0d0d]">{order.customer?.name || 'Customer'}</div>
                          <div className="text-xs text-gray-400">{order.customer?.phone || 'No phone'}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-sm text-[#0d0d0d]">₹{order.totalAmount?.toLocaleString('en-IN')}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {order.paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : order.paymentMethod || 'Direct Order'}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={order.paymentStatus || 'Pending'}
                            onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                            className={`border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer transition-colors ${
                              order.paymentStatus === 'Paid' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={order.orderStatus || 'Processing'}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-white outline-none focus:border-black cursor-pointer"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>

                      {expandedOrderId === order._id && (
                        <tr className="bg-gray-50/60">
                          <td colSpan="5" className="px-5 py-5 border-b border-gray-100">
                            <div className="grid md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-black/5 shadow-sm">
                              <div>
                                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2.5">
                                  Delivery Information
                                </h4>
                                <p className="text-sm font-semibold text-[#0d0d0d]">{order.customer?.name}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {[order.deliveryAddress?.house, order.deliveryAddress?.street].filter(Boolean).join(', ')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {[order.deliveryAddress?.city, order.deliveryAddress?.state].filter(Boolean).join(', ')}
                                  {order.deliveryAddress?.zip ? ` - ${order.deliveryAddress.zip}` : ''}
                                </p>
                                <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                                  <p><span className="font-medium text-gray-800">Phone:</span> {order.customer?.phone || 'N/A'}</p>
                                  {order.customer?.email && <p><span className="font-medium text-gray-800">Email:</span> {order.customer.email}</p>}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2.5">
                                  Items Purchased ({order.items?.length || 0})
                                </h4>
                                <ul className="space-y-2.5">
                                  {order.items?.map((item, idx) => (
                                    <li key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                                      <div className="flex items-center gap-3">
                                        {item.image && (
                                          <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-md border border-black/5" />
                                        )}
                                        <div>
                                          <p className="text-xs font-semibold text-[#0d0d0d]">{item.name}</p>
                                          <p className="text-[11px] text-gray-400">
                                            Qty: {item.quantity} {[item.size, item.color].filter(Boolean).join(' · ')}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="text-xs font-bold text-[#0d0d0d]">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card-Based Order List (Below md) */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map(order => (
              <div key={order._id} className="bg-white rounded-xl p-4 shadow-sm border border-black/5">
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#0d0d0d]">
                      #{order._id.slice(-6)}
                    </span>
                    <span className="text-[11px] text-gray-400 ml-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#0d0d0d]">
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="py-3">
                  <p className="font-semibold text-sm text-[#0d0d0d]">{order.customer?.name || 'Customer'}</p>
                  <p className="text-xs text-gray-400">{order.customer?.phone || 'No phone'}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Method: {order.paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : order.paymentMethod || 'Direct Order'}
                  </p>
                </div>

                {/* Status Dropdowns */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-gray-100">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Payment</span>
                    <select
                      value={order.paymentStatus || 'Pending'}
                      onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer ${
                        order.paymentStatus === 'Paid' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Status</span>
                    <select
                      value={order.orderStatus || 'Processing'}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-white outline-none"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Details Accordion Toggle */}
                <button
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                  className="w-full mt-3 pt-2 text-xs text-indigo-600 font-semibold border-t border-gray-100 flex items-center justify-center gap-1"
                >
                  <span>{expandedOrderId === order._id ? 'Hide Details' : 'View Full Details'}</span>
                  {expandedOrderId === order._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Expanded Details on Mobile */}
                {expandedOrderId === order._id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-3 bg-gray-50/70 p-3 rounded-lg">
                    <div>
                      <h4 className="font-bold text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                        Shipping Address
                      </h4>
                      <p className="text-gray-700">
                        {[order.deliveryAddress?.house, order.deliveryAddress?.street].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-gray-700">
                        {[order.deliveryAddress?.city, order.deliveryAddress?.state].filter(Boolean).join(', ')}
                        {order.deliveryAddress?.zip ? ` - ${order.deliveryAddress.zip}` : ''}
                      </p>
                      {order.customer?.email && <p className="text-gray-500 mt-1">Email: {order.customer.email}</p>}
                    </div>

                    <div>
                      <h4 className="font-bold text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">
                        Items ({order.items?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-black/5">
                            <div className="flex items-center gap-2">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="w-8 h-10 object-cover rounded" />
                              )}
                              <div>
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-[10px] text-gray-400">
                                  Qty: {item.quantity} {[item.size, item.color].filter(Boolean).join(' · ')}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrders;