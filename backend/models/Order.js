const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true }
  },
  deliveryAddress: {
    house: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true }
  },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      size: { type: String },
      color: { type: String },
      image: { type: String }
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Razorpay', 'Cash on Delivery', 'WhatsApp'], 
    required: true 
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  userId: { type: String }, // Optional, if user is logged in
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
