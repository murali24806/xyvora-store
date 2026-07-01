import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = activeCategory ? `?category=${activeCategory}` : '';
    api
      .get(`/products${query}`)
      .then((res) => {
        setProducts(res.data.products || []);
      })
      .catch((err) => {
        console.error('Filter API Error:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handleCategoryClick = (slug) => {
    if (slug === activeCategory) {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-32 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs font-bold uppercase tracking-[0.3em] mb-4" 
            style={{ color: 'var(--color-accent)' }}
          >
            The Collection
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl uppercase tracking-tighter"
          >
            Shop All
          </motion.h1>
        </div>

        {/* Filter Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 hide-scrollbar"
        >
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase opacity-50 mr-2">
            <Filter size={16} />
            Filter
          </div>
          <button
            onClick={() => setSearchParams({})}
            className={`shrink-0 px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
              !activeCategory ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
            }`}
            style={
              !activeCategory
                ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }
                : { border: '1px solid rgba(107,107,107,0.2)' }
            }
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`shrink-0 px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${
                activeCategory === cat.slug ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              style={
                activeCategory === cat.slug
                  ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }
                  : { border: '1px solid rgba(107,107,107,0.2)' }
              }
            >
              {cat.name}
            </button>
          ))}
        </motion.div>
      </div>

      <div>
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-32"
          >
            <div className="w-8 h-8 rounded-full animate-ping" style={{ backgroundColor: 'var(--color-accent)' }}></div>
          </motion.div>
        ) : products.length === 0 ? (
          <div 
            key="empty"
            className="text-center py-32"
          >
            <p className="font-display text-4xl mb-4">Nothing here yet</p>
            <p className="opacity-60 text-lg">Check back soon — new drops are on the way.</p>
          </div>
        ) : (
          <div 
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
          >
            {products.map((p) => (
              <div key={p._id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
