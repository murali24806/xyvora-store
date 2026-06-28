import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FALLBACK_IMAGE =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#e5e5e0"/><text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#999" text-anchor="middle" dy=".3em">No Image</text></svg>`
  );

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  
  const primaryImage = product.images?.[0] || FALLBACK_IMAGE;
  const secondaryImage = product.images?.[1] || primaryImage; // swap to second image on hover if it exists

  return (
    <Link 
      to={`/product/${product.slug}`} 
      className="group block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasDiscount && <span className="tag-corner">SALE</span>}
      
      <div className="overflow-hidden bg-surface aspect-[4/5] mb-4 rounded-xl relative shadow-sm transition-all duration-500 group-hover:shadow-2xl">
        <motion.img
          initial={false}
          animate={{ opacity: isHovered && product.images?.length > 1 ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          src={primaryImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        
        {product.images?.length > 1 && (
          <motion.img
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Quick View Button Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-4 left-4 right-4 flex justify-center"
        >
          <div 
            className="w-full py-3 text-center text-xs font-bold uppercase tracking-widest rounded-lg glass-dark"
            style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-accent)' }}
          >
            Quick View
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col items-center text-center">
        <h3 className="font-display tracking-wide text-lg md:text-xl leading-snug mb-1 transition-colors group-hover:text-accent">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-3">
          {hasDiscount ? (
            <>
              <span className="font-bold text-lg">₹{product.discountPrice.toLocaleString('en-IN')}</span>
              <span className="text-sm opacity-50 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="font-bold text-lg opacity-80 group-hover:opacity-100 transition-opacity">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
