import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useUserAuth } from '../context/UserAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import MagneticButton from './MagneticButton';

const Header = () => {
  const { totalItems } = useCart();
  const { settings } = useSiteSettings();
  const { user, logout } = useUserAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHome ? 'py-2' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div
            className={`flex items-center justify-between h-16 px-6 md:px-8 rounded-2xl transition-all duration-300 ${
              scrolled || !isHome ? 'glass shadow-lg border border-white/10' : 'bg-transparent'
            }`}
            style={{ 
              backgroundColor: scrolled || !isHome ? 'var(--color-headerBg)' : 'transparent',
              color: 'var(--color-headerText)' 
            }}
          >
            {/* Logo */}
            <Link 
              to="/" 
              className="font-display text-3xl tracking-wider hover:scale-105 transition-transform" 
              style={{ color: 'var(--color-headerText)' }}
            >
              {settings?.storeName || 'XYVORA'}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-10">
              {['Home', 'Collections', 'About', 'Contact'].map((item) => (
                <MagneticButton key={item}>
                  <Link
                    to={item === 'Home' ? '/' : item === 'Collections' ? '/shop' : `/${item.toLowerCase()}`}
                    className="relative text-sm font-semibold tracking-widest uppercase transition-colors duration-300 hover:text-accent"
                  >
                    {item}
                  </Link>
                </MagneticButton>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-6">
              {user ? (
                <div className="hidden md:flex items-center gap-4">
                  <Link to="/profile" className="text-xs uppercase tracking-widest opacity-60 hover:text-accent transition-colors">
                    Hi, {user.displayName ? user.displayName.split(' ')[0] : 'User'}
                  </Link>
                  <button onClick={logout} className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors">
                    Logout
                  </button>
                </div>
              ) : (
                <MagneticButton>
                  <Link
                    to="/login"
                    className="hidden md:flex relative items-center group transition-transform hover:scale-110"
                    style={{ color: 'var(--color-headerText)' }}
                    aria-label="Login"
                  >
                    <User size={24} strokeWidth={1.5} />
                  </Link>
                </MagneticButton>
              )}

              <MagneticButton>
                <Link
                  to="/cart"
                  className="relative flex items-center group transition-transform hover:scale-110"
                  style={{ color: 'var(--color-headerText)' }}
                  aria-label={`Cart, ${totalItems} items`}
                >
                  <ShoppingBag size={24} strokeWidth={1.5} />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-3 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </MagneticButton>

              <button
                className="md:hidden transition-transform hover:scale-110"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                style={{ color: 'var(--color-headerText)' }}
              >
                <Menu size={28} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 100% 0)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex flex-col justify-center items-center"
            style={{ backgroundColor: 'var(--color-headerBg)', color: 'var(--color-headerText)' }}
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={32} />
            </button>
            
            <nav className="flex flex-col gap-8 text-center">
              <NavLink 
                to="/" 
                className="font-display text-5xl tracking-widest uppercase hover:text-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink 
                to="/shop" 
                className="font-display text-5xl tracking-widest uppercase hover:text-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Collections
              </NavLink>
              <NavLink 
                to="/about" 
                className="font-display text-5xl tracking-widest uppercase hover:text-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                About
              </NavLink>
              <NavLink 
                to="/contact" 
                className="font-display text-5xl tracking-widest uppercase hover:text-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </NavLink>
              
              {user ? (
                <>
                  <NavLink 
                    to="/profile" 
                    className="font-display text-5xl tracking-widest uppercase hover:text-accent transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button 
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="font-display text-5xl tracking-widest uppercase text-red-500 hover:text-accent transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink 
                  to="/login" 
                  className="font-display text-5xl tracking-widest uppercase hover:text-accent transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </NavLink>
              )}
            </nav>
            
            <div className="absolute bottom-10 font-display text-xl tracking-widest opacity-50">
              {settings?.storeName || 'XYVORA'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
