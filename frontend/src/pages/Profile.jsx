import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const Profile = () => {
  const { user } = useUserAuth();
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
      <div className="max-w-2xl w-full bg-surface p-10 rounded-xl shadow-xl">
        <h2 className="font-display text-4xl mb-2">Your Profile</h2>
        <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-8">{user.email}</p>
        
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
    </div>
  );
};

export default Profile;
