import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#161616] rounded-md p-8">
        <h1 className="font-display text-3xl text-white mb-2 text-center">XYVORA</h1>
        <p className="text-center text-xs uppercase tracking-widest text-white/40 mb-8">Admin panel</p>

        {error && (
          <p className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-sm mb-4">
            {error}
          </p>
        )}

        <label className="block mb-4">
          <span className="block text-xs uppercase tracking-widest text-white/50 mb-1">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-sm bg-[#0d0d0d] border border-white/15 text-white text-sm focus:border-[#d4ff3f] outline-none"
          />
        </label>

        <label className="block mb-6">
          <span className="block text-xs uppercase tracking-widest text-white/50 mb-1">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-sm bg-[#0d0d0d] border border-white/15 text-white text-sm focus:border-[#d4ff3f] outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-bold uppercase text-sm tracking-wide bg-[#d4ff3f] text-[#0d0d0d] disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
