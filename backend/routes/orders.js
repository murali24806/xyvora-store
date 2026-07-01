const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
// It's safe to use placeholders if env vars are missing for now, 
// but it will fail at runtime if a Razorpay request is made.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// Create a Razorpay Order
router.post('/razorpay/create', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    // Amount is expected in the smallest currency unit (e.g., paise)
    const options = {
      amount: amount * 100, // convert to paise
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ message: 'Error creating Razorpay order' });

    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating razorpay order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Verify Razorpay Payment and Save Order
router.post('/razorpay/verify', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails 
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is verified, save the order
      const newOrder = new Order({
        ...orderDetails,
        paymentMethod: 'Razorpay',
        paymentStatus: 'Paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });
      await newOrder.save();
      
      return res.status(200).json({ message: 'Payment verified successfully', order: newOrder });
    } else {
      return res.status(400).json({ message: 'Invalid payment signature!' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create Cash on Delivery Order
router.post('/cod', async (req, res) => {
  try {
    const { orderDetails } = req.body;

    const newOrder = new Order({
      ...orderDetails,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error('Error creating COD order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all orders (For Admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get orders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user orders' });
  }
});

// Update order status (For Admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order' });
  }
});

module.exports = router;
