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
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

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
      addToCart(product, selectedSize);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ background: '#fff', color: '#1a1a1a', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container" style={{ padding: '2rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '3rem', fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <Link to="/" style={{ color: '#aaa', textDecoration: 'none' }}>Home</Link>
          <IconChevronRight size={10} />
          <Link to={`/collections/${product.category}`} style={{ color: '#aaa', textDecoration: 'none' }}>{product.category.replace('-', ' ')}</Link>
          <IconChevronRight size={10} />
          <span style={{ color: '#1a1a1a' }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'start' }}>
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ position: 'sticky', top: '100px' }}
          >
            <div style={{ position: 'relative', aspectRatio: '4/5', background: '#f8f8f8', overflow: 'hidden' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
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

            {/* Size Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>SELECT SIZE</span>
                <Link to="/care" style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'underline' }}>Size Guide</Link>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      width: '50px', height: '50px',
                      border: selectedSize === size ? '2px solid #1a1a1a' : '1px solid #eee',
                      background: selectedSize === size ? '#1a1a1a' : 'transparent',
                      color: selectedSize === size ? '#fff' : '#1a1a1a',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>QUANTITY</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #eee', padding: '0.25rem', opacity: product.stock <= 0 ? 0.5 : 1 }}>
                <button
                  disabled={product.stock <= 0}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: product.stock <= 0 ? 'not-allowed' : 'pointer' }}
                >
                  <IconMinus size={16} />
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{product.stock <= 0 ? 0 : quantity}</span>
                <button
                  disabled={product.stock <= 0 || quantity >= product.stock}
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: (product.stock <= 0 || quantity >= product.stock) ? 'not-allowed' : 'pointer' }}
                >
                  <IconPlus size={16} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {product.stock <= 0 ? (
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
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
    </div>
  );
}
