import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useUserAuth } from '../context/UserAuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { openWhatsAppCheckout } from '../utils/whatsapp';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { settings } = useSiteSettings();
  const { user } = useUserAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressObj, setAddressObj] = useState({
    house: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setCustomerName(user.displayName || '');
        setCustomerEmail(user.email || '');
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.name && !user.displayName) setCustomerName(data.name);
            if (data.phone) setCustomerPhone(data.phone);
            if (data.address) setAddressObj(data.address);
          }
        } catch (error) {
          console.error("Error fetching profile in cart:", error);
        }
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  const handleCheckout = async () => {
    setError('');
    
    // Validate required fields
    if (!customerName.trim() || !customerPhone.trim() || !addressObj.house.trim() || !addressObj.street.trim() || !addressObj.city.trim() || !addressObj.state.trim() || !addressObj.zip.trim()) {
      setError('Please fill in all delivery details below to proceed.');
      return;
    }

    setIsProcessing(true);

    // Save back to Firestore if logged in
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: addressObj
        }, { merge: true });
      } catch (err) {
        console.error("Error auto-saving profile:", err);
      }
    }

    // Format address into a single string for WhatsApp
    const formattedAddress = `${addressObj.house}, ${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.zip}`;

    openWhatsAppCheckout(settings?.whatsappNumber, items, totalPrice, {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: formattedAddress,
    });
    
    setIsProcessing(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 pt-32 pb-20 text-center">
        <p className="font-display text-3xl mb-4 text-ink">Your cart is empty</p>
        <p className="text-secondary text-sm mb-8">Add something you'll actually wear.</p>
        <Link
          to="/shop"
          className="inline-block px-8 py-4 font-bold uppercase text-sm tracking-wide"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 pt-32 pb-20">
      <h1 className="font-display text-3xl md:text-4xl mb-8 text-ink">Your cart</h1>

      <div className="flex flex-col gap-5 mb-8">
        {items.map((item) => (
          <div key={item.lineId} className="flex gap-4 items-center border-b border-secondary/15 pb-5">
            <div className="w-20 h-24 bg-surface rounded-sm overflow-hidden shrink-0">
              {item.image || (item.images && item.images.length > 0) ? (
                <img src={item.image || item.images[0]} alt={item.name} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm md:text-base text-ink">{item.name}</h3>
              <p className="text-xs text-secondary mb-2">
                {[item.size, item.color].filter(Boolean).join(' · ')}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                  className="w-7 h-7 border rounded-sm text-sm font-bold"
                  style={{ borderColor: 'rgba(107,107,107,0.3)' }}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold text-ink">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                  className="w-7 h-7 border rounded-sm text-sm font-bold"
                  style={{ borderColor: 'rgba(107,107,107,0.3)' }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-ink">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              <button
                onClick={() => removeFromCart(item.lineId)}
                className="text-xs text-secondary underline mt-1"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-sm p-5 md:p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-ink">
            Delivery Details (Required)
          </p>
          {user && (
            <p className="text-xs text-secondary italic">
              Auto-saves to your profile
            </p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-600 p-3 text-sm font-bold rounded-sm mb-4">
            {error}
          </div>
        )}

        {loadingProfile ? (
          <div className="animate-pulse flex flex-col gap-3">
             <div className="h-10 bg-black/5 rounded-sm"></div>
             <div className="h-10 bg-black/5 rounded-sm"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Your Full Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="px-4 py-3 rounded-sm border border-secondary/30 bg-transparent text-sm text-ink outline-none focus:border-ink"
            />
            <input
              type="tel"
              required
              placeholder="Phone Number (e.g. 9876543210)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="px-4 py-3 rounded-sm border border-secondary/30 bg-transparent text-sm text-ink outline-none focus:border-ink"
            />
            <input
              type="email"
              placeholder="Email Address (Optional)"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="px-4 py-3 rounded-sm border border-secondary/30 bg-transparent text-sm text-ink outline-none focus:border-ink md:col-span-2"
            />
            <input
              type="text"
              required
              placeholder="House / Flat Number"
              value={addressObj.house}
              onChange={(e) => setAddressObj({...addressObj, house: e.target.value})}
              className="px-4 py-3 rounded-sm border border-secondary/30 bg-transparent text-sm text-ink outline-none focus:border-ink"
            />
            <input
              type="text"
              required
              placeholder="Street Address (Road, Landmark)"
              value={addressObj.street}
              onChange={(e) => setAddressObj({...addressObj, street: e.target.value})}
              className="px-4 py-3 rounded-sm border border-secondary/30 bg-transparent text-sm text-ink outline-none focus:border-ink"
            />
            <input
              type="text"
              required
              placeholder="City"
              value={addressObj.city}
              onChange={(e) => setAddressObj({...addressObj, city: e.target.value})}
              className="px-4 py-3 rounded-sm border border-secondary/30 bg-transparent text-sm text-ink outline-none focus:border-ink"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="State"
                value={addressObj.state}
                onChange={(e) => setAddressObj({...addressObj, state: e.target.value})}
                className="px-4 py-3 rounded-sm border border-secondary/30 bg-transparent text-sm text-ink outline-none focus:border-ink"
              />
              <input
                type="text"
                required
                placeholder="PIN Code"
                value={addressObj.zip}
                onChange={(e) => setAddressObj({...addressObj, zip: e.target.value})}
                className="px-4 py-3 rounded-sm border border-secondary/30 bg-transparent text-sm text-ink outline-none focus:border-ink"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-secondary text-sm">Total</span>
        <span className="font-display text-2xl text-ink">₹{totalPrice.toLocaleString('en-IN')}</span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isProcessing || loadingProfile}
        className="w-full py-4 font-bold uppercase text-sm tracking-wide flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
        style={{ backgroundColor: '#25D366', color: '#0d0d0d' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.6 6.32A8.86 8.86 0 0012.04 4a8.94 8.94 0 00-7.74 13.39L3 21l3.74-1.21a8.93 8.93 0 004.3 1.1h.01a8.94 8.94 0 006.32-15.28zM12.05 19.4a7.4 7.4 0 01-3.78-1.04l-.27-.16-2.81.9.9-2.74-.18-.28a7.42 7.42 0 1113.7-3.93 7.43 7.43 0 01-7.56 7.25zm4.07-5.56c-.22-.11-1.31-.65-1.51-.72-.2-.08-.35-.11-.5.11-.15.22-.57.72-.7.86-.13.15-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.65-.58-1.09-1.3-1.22-1.52-.13-.22-.01-.34.11-.46.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.41-.06-.11-.5-1.21-.69-1.65-.18-.43-.37-.37-.5-.38-.13-.01-.28-.01-.43-.01-.15 0-.39.05-.6.28-.21.22-.81.79-.81 1.92s.83 2.22.95 2.37c.11.16 1.56 2.38 3.78 3.24 2.22.86 2.22.57 2.62.54.4-.04 1.31-.54 1.49-1.06.18-.52.18-.97.13-1.06-.05-.1-.2-.16-.42-.27z" />
        </svg>
        {isProcessing ? 'Processing...' : 'Checkout on WhatsApp'}
      </button>

      <p className="text-center text-xs text-secondary mt-3">
        You'll be redirected to WhatsApp with your order pre-filled.
      </p>

      <button onClick={clearCart} className="block mx-auto mt-6 text-xs text-secondary underline">
        Clear cart
      </button>
    </div>
  );
};

export default Cart;
