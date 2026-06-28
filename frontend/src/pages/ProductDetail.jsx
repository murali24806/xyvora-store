import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-black/10 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-bold uppercase tracking-widest text-xs"
      >
        {title}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 text-sm opacity-80 font-light leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data);
        setSelectedSize(res.data.sizes?.[0] || '');
        setSelectedColor(res.data.colors?.[0] || '');
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="h-screen flex justify-center items-center">
       <div className="w-8 h-8 rounded-full animate-ping" style={{ backgroundColor: 'var(--color-accent)' }}></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-5">
      <p className="font-display text-5xl mb-6">Product not found</p>
      <Link to="/shop" className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors pb-2 border-b-2 border-current">
        Back to shop
      </Link>
    </div>
  );

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart(product, { size: selectedSize, color: selectedColor, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-[90rem] mx-auto px-5 md:px-8 py-20 md:py-32">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
        
        {/* Left: Image Carousel */}
        <div className="w-full lg:w-3/5 lg:sticky lg:top-32 h-fit">
          <div className="relative bg-surface rounded-xl overflow-hidden aspect-[4/5] md:h-[75vh]">
            {product.images?.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImageIndex}
                    src={product.images[currentImageIndex]}
                    alt={`${product.name} - view ${currentImageIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                {product.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex justify-center items-center rounded-full bg-white/80 backdrop-blur text-black shadow-lg hover:bg-white transition-colors z-10"
                      aria-label="Previous image"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex justify-center items-center rounded-full bg-white/80 backdrop-blur text-black shadow-lg hover:bg-white transition-colors z-10"
                      aria-label="Next image"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                    
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                      {product.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-black w-6' : 'bg-black/40 hover:bg-black/60'}`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-50">
                No image
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-accent opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Scrolling Details */}
        <div className="w-full lg:w-2/5 pt-10 lg:pt-0">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {product.category?.name && (
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-50 mb-4">{product.category.name}</p>
            )}
            
            <h1 className="font-display text-5xl md:text-6xl mb-6 tracking-tighter leading-none">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-display tracking-wide">
                    ₹{product.discountPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xl opacity-40 line-through font-display tracking-wide">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="ml-2 px-3 py-1 text-xs font-bold uppercase rounded-sm bg-accent text-primary">Sale</span>
                </>
              ) : (
                <span className="text-3xl font-display tracking-wide">₹{product.price.toLocaleString('en-IN')}</span>
              )}
            </div>

            <div className="h-px w-full bg-black/10 mb-8"></div>

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest">Select Size</p>
                  <button className="text-xs opacity-50 hover:opacity-100 underline underline-offset-4">Size Guide</button>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="w-14 h-14 flex items-center justify-center text-sm font-bold uppercase rounded-sm border transition-all duration-300"
                      style={
                        selectedSize === size
                          ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-background)', borderColor: 'var(--color-primary)' }
                          : { borderColor: 'rgba(107,107,107,0.2)', color: 'var(--color-text)' }
                      }
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest mb-4">Select Color</p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="px-6 py-4 text-sm font-bold uppercase rounded-sm border transition-all duration-300"
                      style={
                        selectedColor === color
                          ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-background)', borderColor: 'var(--color-primary)' }
                          : { borderColor: 'rgba(107,107,107,0.2)', color: 'var(--color-text)' }
                      }
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Actions */}
            <div className="flex gap-4 mb-12">
              <div className="flex items-center border rounded-sm" style={{ borderColor: 'rgba(107,107,107,0.2)' }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-14 flex items-center justify-center hover:bg-black/5 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-14 flex items-center justify-center hover:bg-black/5 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <MagneticButton>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 h-14 px-8 font-bold uppercase text-sm tracking-widest transition-transform rounded-sm shadow-xl"
                  style={{
                    backgroundColor: added ? 'var(--color-success)' : 'var(--color-accent)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {added ? 'Added to bag' : product.inStock ? 'Add to bag' : 'Out of stock'}
                </button>
              </MagneticButton>
            </div>

            {/* Accordions */}
            <div className="mt-12 border-t border-black/10">
              <Accordion title="Description" defaultOpen={true}>
                {product.description || 'Premium streetwear essential.'}
              </Accordion>
              <Accordion title="Shipping & Returns">
                <ul className="list-disc pl-4 space-y-2">
                  <li>Free standard shipping on orders over ₹2000.</li>
                  <li>Express shipping available at checkout.</li>
                  <li>30-day return policy for unworn items with tags attached.</li>
                </ul>
              </Accordion>
              <Accordion title="Care Instructions">
                <ul className="list-disc pl-4 space-y-2">
                  <li>Machine wash cold inside out.</li>
                  <li>Do not bleach or tumble dry.</li>
                  <li>Iron on reverse.</li>
                </ul>
              </Accordion>
            </div>
            
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
