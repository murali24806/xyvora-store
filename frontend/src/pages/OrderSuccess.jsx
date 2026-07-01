import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-32 pb-20 text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h1 className="font-display text-3xl md:text-4xl mb-4 text-ink">Order Successful!</h1>
      <p className="text-secondary mb-8">
        Thank you for your purchase. Your order has been successfully placed.
      </p>

      {order && (
        <div className="bg-surface p-6 rounded-sm mb-8 text-left border border-secondary/15">
          <h3 className="font-bold text-ink mb-4 border-b border-secondary/15 pb-2">Order Summary</h3>
          <p className="text-sm text-secondary mb-2">
            <span className="font-semibold text-ink">Order ID:</span> {order._id}
          </p>
          <p className="text-sm text-secondary mb-2">
            <span className="font-semibold text-ink">Payment Method:</span> {order.paymentMethod}
          </p>
          <p className="text-sm text-secondary mb-2">
            <span className="font-semibold text-ink">Status:</span> {order.orderStatus}
          </p>
          <p className="text-sm text-secondary mb-4">
            <span className="font-semibold text-ink">Total Amount:</span> ₹{order.totalAmount?.toLocaleString('en-IN')}
          </p>
          
          <h4 className="text-sm font-bold text-ink mt-4 mb-2">Shipping To:</h4>
          <p className="text-sm text-secondary">
            {order.customer?.name} <br/>
            {order.deliveryAddress?.house}, {order.deliveryAddress?.street} <br/>
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.zip}
          </p>
        </div>
      )}

      <Link
        to="/shop"
        className="inline-block px-8 py-4 font-bold uppercase text-sm tracking-wide bg-ink text-bg transition-transform hover:-translate-y-0.5"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderSuccess;
