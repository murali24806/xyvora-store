import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useUserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-bg px-5 py-20">
      <div className="max-w-md w-full bg-surface p-10 rounded-xl shadow-xl">
        <h2 className="font-display text-4xl mb-6 text-center">Create Account</h2>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Full Name</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-black/10 rounded-sm focus:outline-none focus:border-accent"
            />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full h-12 mt-4 bg-accent text-primary font-bold uppercase text-sm tracking-widest rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-black/10"></div>
          <span className="px-4 text-xs font-bold uppercase tracking-widest opacity-40">or</span>
          <div className="flex-1 h-px bg-black/10"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="w-full h-12 flex items-center justify-center gap-3 border border-black/10 hover:bg-black/5 transition-colors font-bold uppercase text-sm tracking-widest rounded-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm opacity-60">
          Already have an account? <Link to="/login" className="font-bold hover:text-accent underline underline-offset-4">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
