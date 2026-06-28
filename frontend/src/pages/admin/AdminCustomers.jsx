import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const customerData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomers(customerData);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError("Failed to load customers. Please ensure your Firestore permissions allow reading.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display text-3xl mb-2 text-[#0d0d0d]">Customers</h2>
          <p className="text-sm text-black/60">View registered users and their contact details.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 text-sm font-bold rounded-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4 mt-8">
          <div className="h-12 bg-black/5 rounded-sm"></div>
          <div className="h-12 bg-black/5 rounded-sm"></div>
          <div className="h-12 bg-black/5 rounded-sm"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-sm shadow-sm">
          <p className="text-black/60 text-sm">No customers found yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0d0d0d] text-white">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-xs">Name</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-xs">Email</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-xs">Phone</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-xs">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#0d0d0d]">
                      {customer.name || <span className="text-black/40 italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {customer.email || <span className="text-black/40 italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 text-black/70">
                      {customer.phone || <span className="text-black/40 italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 text-black/70 max-w-xs">
                      {customer.address ? (
                        <span className="truncate block">
                          {[
                            customer.address.house,
                            customer.address.street,
                            customer.address.city,
                            customer.address.state,
                            customer.address.zip
                          ].filter(Boolean).join(', ')}
                        </span>
                      ) : (
                        <span className="text-black/40 italic">Not provided</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
