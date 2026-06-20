import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { 
  ChevronRight as IconChevronRight, 
  ChevronLeft as IconChevronLeft, 
  Plus as IconPlus, 
  Minus as IconMinus, 
  ShieldCheck as IconShieldCheck, 
  Truck as IconTruck, 
  RefreshCcw as IconRefreshCcw 
} from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const product = products.find(p => p.id.toString() === productId);
  const requiresSize = product?.category !== 'accessories';
  const variations = product?.parsedVariations || [];
  const availableColors = [...new Set(variations.map(v => v.color))].filter(Boolean);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const allImages = product ? [product.image, ...(product.parsedGallery || [])].filter(Boolean) : [];

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  const availableSizesForColor = variations
    .filter(v => v.color === selectedColor && Number(v.quantity) > 0)
    .map(v => v.size)
    .filter(Boolean);

  useEffect(() => {
    if (requiresSize && selectedColor) {
      if (availableSizesForColor.length > 0) {
        if (!availableSizesForColor.includes(selectedSize)) {
          setSelectedSize(availableSizesForColor[0]);
        }
      } else {
        setSelectedSize('');
      }
    }
  }, [selectedColor, availableSizesForColor, requiresSize, selectedSize]);

  const currentVariation = variations.find(v => 
    v.color === selectedColor && (requiresSize ? v.size === selectedSize : true)
  );
  const maxStock = variations.length > 0
    ? (currentVariation ? Number(currentVariation.quantity) : 0)
    : Number(product.stock || 0);

  useEffect(() => {
    if (quantity > maxStock) {
      setQuantity(Math.max(1, maxStock));
    }
  }, [maxStock, quantity]);

  // Suggested products from the same category
  const relatedProducts = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  if (!product) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>Product not found</h2>
        <Link to="/" style={{ color: '#1a1a1a', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>Return to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ background: '#fff', color: '#1a1a1a', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '2rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '3rem', fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <button 
            onClick={() => window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/')}
            style={{ background: 'none', border: 'none', padding: 0, color: '#aaa', cursor: 'pointer', fontSize: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1a1a1a'}
            onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
          >
            <IconChevronLeft size={12} strokeWidth={2.5} /> Go Back
          </button>
          <span style={{ margin: '0 0.1rem' }}>|</span>
          <Link to="/" style={{ color: '#aaa', textDecoration: 'none' }}>Home</Link>
          <IconChevronRight size={10} />
          <Link to={`/collections/${product.category}`} style={{ color: '#aaa', textDecoration: 'none' }}>{product.category.replace('-', ' ')}</Link>
          <IconChevronRight size={10} />
          <span style={{ color: '#1a1a1a' }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'start' }}>
          {/* Image Gallery */}
          <motion.div
            className="product-gallery-container"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div style={{ position: 'relative', aspectRatio: '4/5', background: '#f8f8f8', overflow: 'hidden' }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIdx}
                  src={allImages[currentImageIdx]}
                  alt={`${product.name} - ${currentImageIdx + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </AnimatePresence>

              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: '#fff', color: '#1a1a1a', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  >
                    <IconChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: '#fff', color: '#1a1a1a', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  >
                    <IconChevronRight size={20} />
                  </button>
                </>
              )}

              {product.badge && (
                <span style={{
                  position: 'absolute', top: '1.5rem', left: '1.5rem',
                  background: '#1a1a1a', color: '#fff', fontSize: '0.7rem',
                  padding: '0.4rem 1rem', letterSpacing: '2px', fontWeight: 700
                }}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {allImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentImageIdx(idx)}
                    style={{ 
                      flexShrink: 0, width: '60px', height: '75px', border: currentImageIdx === idx ? '2px solid #1a1a1a' : '1px solid transparent', 
                      padding: 0, background: 'none', cursor: 'pointer', transition: 'all 0.2s' 
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <div>
              <p style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                ZANNY COLLECTION
              </p>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, marginBottom: '1rem' }}>
                {product.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600 }}>
                  KSh {product.price.toLocaleString()}
                </p>
                {product.original_price && (
                  <p style={{ color: '#888', fontSize: '1.1rem', textDecoration: 'line-through' }}>
                    KSh {Number(product.original_price).toLocaleString()}
                  </p>
                )}
                {product.discount_label && (
                  <span style={{ background: '#c0392b', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', letterSpacing: '1px', fontWeight: 600 }}>
                    {product.discount_label}
                  </span>
                )}
              </div>
            </div>

            <p style={{ color: '#555', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {product.description}
            </p>

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: '1rem' }}>SELECT COLOR</span>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: selectedColor === color ? '2px solid #1a1a1a' : '1px solid #eee',
                        background: selectedColor === color ? '#1a1a1a' : 'transparent',
                        color: selectedColor === color ? '#fff' : '#1a1a1a',
                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {requiresSize && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>SELECT SIZE</span>
                  <Link to="/care" style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'underline' }}>Size Guide</Link>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                    // Check if this size exists for ANY color (just to show it disabled if it exists in the product but not for this color)
                    const sizeExistsInProduct = variations.some(v => v.size === size);
                    if (!sizeExistsInProduct && availableSizesForColor.length > 0) return null; // hide completely if product never uses this size

                    const isAvailable = availableSizesForColor.includes(size);
                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          width: '50px', height: '50px',
                          border: selectedSize === size && isAvailable ? '2px solid #1a1a1a' : '1px solid #eee',
                          background: selectedSize === size && isAvailable ? '#1a1a1a' : 'transparent',
                          color: selectedSize === size && isAvailable ? '#fff' : (!isAvailable ? '#ccc' : '#1a1a1a'),
                          fontSize: '0.8rem', fontWeight: 600, cursor: isAvailable ? 'pointer' : 'not-allowed',
                          textDecoration: !isAvailable ? 'line-through' : 'none',
                          opacity: !isAvailable ? 0.5 : 1,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {availableSizesForColor.length === 0 && selectedColor && (
                  <p style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: '0.5rem' }}>This color is currently out of stock in all sizes.</p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>QUANTITY</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #eee', padding: '0.25rem', opacity: maxStock <= 0 ? 0.5 : 1 }}>
                <button
                  disabled={maxStock <= 0 || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: (maxStock <= 0 || quantity <= 1) ? 'not-allowed' : 'pointer', opacity: (maxStock <= 0 || quantity <= 1) ? 0.3 : 1 }}
                >
                  <IconMinus size={16} />
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{maxStock <= 0 ? 0 : quantity}</span>
                <button
                  disabled={maxStock <= 0 || quantity >= maxStock}
                  onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                  style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: (maxStock <= 0 || quantity >= maxStock) ? 'not-allowed' : 'pointer', opacity: (maxStock <= 0 || quantity >= maxStock) ? 0.3 : 1 }}
                >
                  <IconPlus size={16} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {maxStock <= 0 ? (
                <button
                  disabled
                  style={{
                    padding: '1.25rem',
                    background: '#e0e0e0', color: '#888', border: 'none',
                    fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px',
                    textTransform: 'uppercase', cursor: 'not-allowed',
                  }}
                >
                  Out of Stock
                </button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  style={{
                    padding: '1.25rem',
                    background: added ? '#27ae60' : '#1a1a1a',
                    color: '#fff', border: 'none',
                    fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px',
                    textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'background 0.3s ease'
                  }}
                >
                  {added ? '✓ Added to Cart' : 'Add to Cart'}
                </motion.button>
              )}
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
              <div style={{ textAlign: 'center' }}>
                <IconTruck size={20} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px' }}>FAST DELIVERY</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <IconRefreshCcw size={20} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px' }}>EASY RETURNS</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <IconShieldCheck size={20} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px' }}>SAFE HUSTLE</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '8rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '3rem', textAlign: 'center' }}>
              You May Also Like
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                    <div style={{ aspectRatio: '3/4', background: '#f8f8f8', marginBottom: '1rem', overflow: 'hidden' }}>
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{p.name}</p>
                    <p style={{ fontSize: '0.85rem', color: '#888' }}>KSh {p.price.toLocaleString()}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .product-gallery-container { position: sticky; top: 100px; }
        @media (max-width: 768px) {
          .product-gallery-container { position: static !important; }
        }
      `}</style>
    </div>
  );
}
