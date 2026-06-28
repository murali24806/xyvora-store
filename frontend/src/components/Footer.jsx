import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { motion } from 'framer-motion';

const Footer = () => {
  const { settings } = useSiteSettings();

  const brandName = settings?.storeName || 'XYVORA';

  return (
    <footer
      className="mt-32 pt-20 overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-footerBg)', color: 'var(--color-footerText)' }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="font-display text-4xl mb-4 block hover:opacity-80 transition-opacity">
            {brandName}
          </Link>
          <p className="text-lg opacity-80 max-w-sm font-light">
            {settings?.tagline || 'Wear the brand. Embrace the culture.'}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] opacity-50 mb-6">Explore</h4>
          <div className="flex flex-col gap-4 text-base font-medium">
            <Link to="/shop" className="opacity-80 hover:opacity-100 hover:translate-x-1 transition-all">
              Latest Drop
            </Link>
            <Link to="/shop" className="opacity-80 hover:opacity-100 hover:translate-x-1 transition-all">
              All Products
            </Link>
            <Link to="/cart" className="opacity-80 hover:opacity-100 hover:translate-x-1 transition-all">
              Your Cart
            </Link>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] opacity-50 mb-6">Location</h4>
          <p className="text-base opacity-80 font-medium">Visakhapatnam, India</p>
          <p className="text-base opacity-80 font-medium mt-2">Worldwide Shipping</p>
        </div>
      </div>

      {/* Giant Marquee Background */}
      <div className="relative mt-20 flex overflow-hidden select-none pointer-events-none opacity-5 w-full">
        <motion.div 
          className="font-display text-[15vw] leading-none tracking-tighter flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        >
          {/* Double the content to allow a seamless -50% translation loop */}
          <div className="flex shrink-0">
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
          </div>
          <div className="flex shrink-0">
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
            <span className="pr-8">{brandName}</span>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-white/10 mt-8 py-6 flex flex-col md:flex-row justify-between items-center px-5 md:px-8 max-w-7xl mx-auto text-xs font-semibold uppercase tracking-widest opacity-60">
        <span>© {new Date().getFullYear()} {brandName}.</span>
        <span className="mt-4 md:mt-0">Built for the culture.</span>
      </div>
    </footer>
  );
};

export default Footer;
