import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { API_URL } from '../utils/api';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';

const OrderTracker = ({ status }) => {
  const steps = [
    { id: 'Processing', label: 'Processing', icon: Package },
    { id: 'Shipped', label: 'Shipped', icon: Truck },
    { id: 'Delivered', label: 'Delivered', icon: CheckCircle }
  ];

  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-600 mt-6 pt-4 border-t border-black/10">
        <XCircle size={20} />
        <span className="font-bold text-sm uppercase tracking-widest">Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.id === status);
  const activeStep = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="mt-8 mb-2 pt-6 border-t border-black/10">
      <div className="relative flex justify-between items-center w-full px-4 md:px-8">
        {/* Background Track */}
        <div className="absolute left-0 top-5 w-full h-1 bg-black/10 rounded-full" style={{ left: '10%', right: '10%', width: '80%' }} />
        
        {/* Animated Progress Track */}
        <motion.div 
          className="absolute left-0 top-5 h-1 bg-ink rounded-full"
          style={{ left: '10%' }}
          initial={{ width: 0 }}
          animate={{ width: `${(activeStep / (steps.length - 1)) * 80}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Steps */}
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeStep;
          const isActive = idx === activeStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.2 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500
                  ${isCompleted ? 'bg-ink border-ink text-bg' : 'bg-surface border-black/20 text-black/40'}
                  ${isActive ? 'shadow-[0_0_15px_rgba(0,0,0,0.15)]' : ''}
                `}
              >
                <Icon size={18} strokeWidth={isCompleted ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-ink' : 'text-black/40'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Profile = () => {
  const { user } = useUserAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'orders'
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Profile Data
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({
    house: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  // Orders Data
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        // Set initial values from Auth object
        setName(user.displayName || '');
        
        // Fetch extended values from Firestore
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.name && !user.displayName) setName(data.name);
            if (data.phone) setPhone(data.phone);
            if (data.address) setAddress(data.address);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const response = await fetch(`${API_URL}/orders/user/${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      // Update Firebase Auth Profile (DisplayName)
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // Update Firestore Database
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        name,
        email: user.email,
        phone,
        address
      }, { merge: true });

      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-bg">
        <p className="text-xl font-bold uppercase tracking-widest opacity-60">Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex justify-center bg-bg px-5 py-16">
      <div className="max-w-4xl w-full bg-surface p-6 md:p-10 rounded-xl shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="font-display text-4xl mb-1">Your Profile</h2>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">{user.email}</p>
          </div>
          
          <div className="flex gap-2 bg-black/5 p-1 rounded-sm">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-sm transition-colors ${activeTab === 'profile' ? 'bg-accent text-primary' : 'hover:bg-black/10'}`}
            >
              Details
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-sm transition-colors ${activeTab === 'orders' ? 'bg-accent text-primary' : 'hover:bg-black/10'}`}
            >
              My Orders
            </button>
          </div>
        </div>

        {activeTab === 'profile' && (
          <div>
            {message && (
              <div className={`p-4 mb-6 rounded-sm text-sm font-bold ${message.includes('Error') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {message}
              </div>
            )}

            {loading ? (
              <div className="animate-pulse flex flex-col gap-4">
                <div className="h-12 bg-black/5 rounded-sm"></div>
                <div className="h-12 bg-black/5 rounded-sm"></div>
                <div className="h-12 bg-black/5 rounded-sm"></div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-6">
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="h-px bg-black/10 my-2 w-full"></div>

                {/* Address Details */}
                <h3 className="text-sm font-bold uppercase tracking-widest">Shipping Address</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">House / Flat Number</label>
                    <input 
                      type="text" 
                      value={address.house}
                      onChange={(e) => setAddress({...address, house: e.target.value})}
                      className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
                      placeholder="Flat 101 / House 2-4"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Street Address</label>
                    <input 
                      type="text" 
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
                      placeholder="Main St, Road No 5"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">City</label>
                    <input 
                      type="text" 
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
                      placeholder="Visakhapatnam"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">State</label>
                    <input 
                      type="text" 
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
                      placeholder="Andhra Pradesh"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">PIN Code</label>
                    <input 
                      type="text" 
                      value={address.zip}
                      onChange={(e) => setAddress({...address, zip: e.target.value})}
                      className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
                      placeholder="530001"
                    />
                  </div>
                </div>

                <button 
                  disabled={saving}
                  type="submit" 
                  className="w-full h-14 mt-4 bg-accent text-primary font-bold uppercase text-sm tracking-widest rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 className="text-xl font-bold font-display mb-6">Order History</h3>
            
            {loadingOrders ? (
              <div className="animate-pulse flex flex-col gap-4">
                <div className="h-24 bg-black/5 rounded-sm"></div>
                <div className="h-24 bg-black/5 rounded-sm"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 bg-black/5 rounded-sm border border-black/10">
                <p className="opacity-60 mb-4">You haven't placed any orders yet.</p>
                <Link to="/shop" className="text-accent hover:underline font-bold">Start Shopping</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map(order => (
                  <div key={order._id} className="border border-black/10 rounded-sm p-5 bg-bg">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-black/10 pb-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Order #{order._id.slice(-8)}</p>
                        <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className="flex flex-col md:items-end gap-1">
                        <p className="font-display text-xl">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                        <div className="flex gap-2">
                          <span className={`text-xs px-2 py-1 rounded-sm font-bold ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-sm" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-bold">{item.name}</p>
                            <p className="text-xs opacity-60">
                              Qty: {item.quantity} {[item.size, item.color].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                    
                    <OrderTracker status={order.orderStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
