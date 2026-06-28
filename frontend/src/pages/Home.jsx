import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { motion, useScroll, useTransform } from 'framer-motion';


const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const { settings } = useSiteSettings();
  const { scrollY } = useScroll();
  
  // Parallax effects
  const heroTextY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    api.get('/products?featured=true&limit=4').then((res) => setFeatured(res.data.products));
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden" 
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {settings?.heroMediaUrl ? (
          settings?.heroMediaType === 'video' ? (
            <video 
              src={settings.heroMediaUrl} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
            />
          ) : (
            <img 
              src={settings.heroMediaUrl} 
              alt="Hero Background"
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
            />
          )
        ) : (
          <video 
            src="/hero-video.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none z-[1]"></div>
        
        <div className="flex flex-col items-center justify-center h-full text-center px-4 relative z-10 pt-20">
          <motion.p 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-sm md:text-base font-bold uppercase tracking-[0.5em] mb-6"
            style={{ color: 'var(--color-accent)' }}
          >
            {settings?.heroSubtitle || 'New Collection'}
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1 
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="font-display text-7xl md:text-9xl uppercase tracking-tighter leading-[0.9] pb-2"
              style={{ color: 'var(--color-background)' }}
            >
              {settings?.heroTitleLine1 || 'Future of'}
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-12">
            <motion.h1 
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="font-display text-7xl md:text-9xl uppercase tracking-tighter leading-[0.9] pb-2"
              style={{ color: 'var(--color-background)' }}
            >
              {settings?.heroTitleLine2 || 'Streetwear'}
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link
              to="/shop"
              className="group relative inline-flex items-center justify-center px-10 py-5 font-bold uppercase text-sm tracking-[0.2em] overflow-hidden rounded-sm"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Collection
                <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <div className="absolute inset-0 h-full w-0 bg-white opacity-20 transition-all duration-300 ease-out group-hover:w-full"></div>
            </Link>
          </motion.div>
        </div>

        {/* Large faint typographic watermark */}
        <div
          className="absolute -right-20 -bottom-20 font-display text-[40vw] leading-none opacity-[0.03] select-none pointer-events-none"
          style={{ color: 'var(--color-background)' }}
          aria-hidden="true"
        >
          XV
        </div>
      </section>

      {/* Categories Asymmetric Grid */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <div className="flex items-end justify-between mb-12">
              <h2 className="font-display text-4xl md:text-6xl uppercase tracking-wide">Curated<br/><span className="text-secondary opacity-50">Lines</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {categories.map((cat, index) => (
                <motion.div 
                  key={cat._id} 
                  variants={itemVariants}
                  className={`relative group overflow-hidden rounded-xl bg-surface ${
                    index % 4 === 0 ? 'md:col-span-8 aspect-[2/1]' : 
                    index % 4 === 1 ? 'md:col-span-4 aspect-square md:aspect-auto md:h-full' : 
                    index % 4 === 2 ? 'md:col-span-4 aspect-square md:aspect-auto md:h-full' : 
                    'md:col-span-8 aspect-[2/1]'
                  }`}
                >
                  <Link to={`/shop?category=${cat.slug}`} className="block w-full h-full">
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105 group-active:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 md:group-hover:bg-black/40 group-active:bg-black/40 transition-colors duration-500"></div>
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <span className="font-display text-3xl md:text-5xl uppercase text-white drop-shadow-lg tracking-widest translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-24 border-t border-black/5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <div className="flex items-end justify-between mb-16">
              <h2 className="font-display text-4xl md:text-6xl uppercase tracking-wide">Signature<br/><span className="text-secondary opacity-50">Pieces</span></h2>
              <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors pb-2 border-b-2 border-current">
                View Gallery
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featured.map((p) => (
                <motion.div key={p._id} variants={itemVariants}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 text-center md:hidden">
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors pb-2 border-b-2 border-current">
                View Gallery
              </Link>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default Home;
