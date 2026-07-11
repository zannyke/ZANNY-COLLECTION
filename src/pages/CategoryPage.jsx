import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, CATEGORIES } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import PageHeader from '../components/PageHeader';
import CustomSelect from '../components/CustomSelect';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SORT_OPTIONS = [
  { value: 'default',     label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest First' },
];

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const requiresSize = product.category !== 'accessories';
  const variations = product.parsedVariations || [];
  
  const availableColors = variations.length > 0
    ? [...new Set(variations.map(v => v.color))].filter(Boolean)
    : (product.parsedColors || []);
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || '');
  const [showAllColors, setShowAllColors] = useState(false);

  const availableSizesForColor = variations.length > 0
    ? variations
        .filter(v => v.color === selectedColor && Number(v.quantity) > 0)
        .map(v => v.size)
        .filter(Boolean)
    : (product.parsedSizes || []);

  const [selectedSize, setSelectedSize] = useState(availableSizesForColor[0] || (requiresSize ? SIZES[2] : ''));
  const [added, setAdded] = useState(false);

  const handleColorChange = (c) => {
    setSelectedColor(c);
    if (requiresSize) {
      const nextSizes = variations.length > 0
        ? variations
            .filter(v => v.color === c && Number(v.quantity) > 0)
            .map(v => v.size)
            .filter(Boolean)
        : (product.parsedSizes || []);
      if (nextSizes.length > 0 && !nextSizes.includes(selectedSize)) {
        setSelectedSize(nextSizes[0]);
      } else if (nextSizes.length === 0) {
        setSelectedSize('');
      }
    }
  };

  const currentVariation = variations.find(v => 
    v.color === selectedColor && (requiresSize ? v.size === selectedSize : true)
  );
  const isPreorder = product.is_preorder === 1 || product.is_preorder === true;
  const maxStock = isPreorder 
    ? 999 
    : (variations.length > 0
        ? (currentVariation ? Number(currentVariation.quantity) : 0)
        : Number(product.stock || 0));
  const isGlobalOutOfStock = !isPreorder && product.stock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (maxStock > 0) {
      addToCart(product, selectedSize, selectedColor);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  const displayedColors = showAllColors ? availableColors : availableColors.slice(0, 3);
  const hasMoreColors = availableColors.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', background: '#f4f4f4' }}>
          {product.image ? (
            <motion.img
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.5 }}
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4' }}>
              <span style={{ color: '#aaa', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase' }}>ZANNY</span>
            </div>
          )}
          {isPreorder && (
            <span style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: '#6f42c1', 
              color: '#fff', fontSize: '0.6rem', fontWeight: 700,
              padding: '0.2rem 0.55rem', letterSpacing: '1.5px',
            }}>
              PRE-ORDER
            </span>
          )}
          {product.badge && (
            <span style={{
              position: 'absolute', top: '0.75rem', left: '0.75rem',
              background: product.badge === 'SALE' ? '#c0392b' : '#1a1a1a',
              color: '#fff', fontSize: '0.6rem', fontWeight: 700,
              padding: '0.2rem 0.55rem', letterSpacing: '1.5px',
            }}>
              {product.badge}
            </span>
          )}
          {isGlobalOutOfStock && (
            <span style={{
              position: 'absolute', bottom: '0.75rem', left: '0.75rem',
              background: '#c0392b', color: '#fff', fontSize: '0.6rem',
              padding: '0.2rem 0.55rem', letterSpacing: '1px', fontWeight: 700
            }}>
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ 
            fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.25rem', letterSpacing: '0.5px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            minHeight: '2.4rem'
          }}>{product.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>KSh {product.price.toLocaleString()}</p>
            {product.original_price && (
              <p style={{ color: '#888', fontSize: '0.75rem', textDecoration: 'line-through' }}>
                KSh {Number(product.original_price).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Color selector */}
      <div style={{ minHeight: '28px', display: 'flex', alignItems: 'flex-start' }}>
        {availableColors.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {displayedColors.map(c => (
              <button key={c} onClick={() => handleColorChange(c)} style={{
                padding: '0.2rem 0.5rem', fontSize: '0.62rem', fontWeight: 600,
                border: selectedColor === c ? '1.5px solid #1a1a1a' : '1px solid #ddd',
                background: selectedColor === c ? '#1a1a1a' : 'transparent',
                color: selectedColor === c ? '#fff' : '#1a1a1a',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>{c}</button>
            ))}
            {hasMoreColors && (
              <span 
                onClick={() => setShowAllColors(!showAllColors)} 
                style={{ fontSize: '0.65rem', color: '#888', cursor: 'pointer', textDecoration: 'underline', marginLeft: '0.25rem' }}
              >
                {showAllColors ? 'less' : `+${availableColors.length - 3} more`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Size selector */}
      <div style={{ minHeight: '32px', marginTop: '0.25rem' }}>
        {requiresSize && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {SIZES.map(s => {
              const isAvailable = availableSizesForColor.includes(s);
              const isSelected = selectedSize === s;
              return (
                <button key={s} disabled={!isAvailable} onClick={() => setSelectedSize(s)} style={{
                  width: '30px', height: '30px', fontSize: '0.62rem', fontWeight: 600,
                  border: isSelected && isAvailable ? '1.5px solid #1a1a1a' : '1px solid #ddd',
                  background: isSelected && isAvailable ? '#1a1a1a' : 'transparent',
                  color: isSelected && isAvailable ? '#fff' : (!isAvailable ? '#c0392b' : '#1a1a1a'),
                  cursor: isAvailable ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  textDecoration: !isAvailable ? 'line-through' : 'none',
                  opacity: !isAvailable ? 0.6 : 1
                }}>{s}</button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add to cart */}
      <motion.button 
        disabled={isGlobalOutOfStock || maxStock <= 0}
        whileTap={maxStock > 0 ? { scale: 0.96 } : {}} 
        onClick={maxStock > 0 ? handleAdd : undefined} 
        style={{
          padding: '0.75rem', marginTop: 'auto',
          background: (isGlobalOutOfStock || maxStock <= 0) ? '#e0e0e0' : (added ? '#2d6a4f' : '#1a1a1a'),
          color: (isGlobalOutOfStock || maxStock <= 0) ? '#888' : '#fff', 
          border: 'none', 
          cursor: (isGlobalOutOfStock || maxStock <= 0) ? 'not-allowed' : 'pointer',
          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '1.5px',
          textTransform: 'uppercase', transition: 'background 0.3s',
          fontFamily: 'var(--font-body)',
        }}>
        {isPreorder ? (added ? '✓ Added Pre-Order' : 'Pre-Order Now') : (isGlobalOutOfStock ? 'Sold Out' : (maxStock <= 0 ? 'Color Out of Stock' : (added ? '✓ Added to Cart' : 'Add to Cart')))}
      </motion.button>
    </motion.div>
  );
}

export default function CategoryPage() {
  const { categoryId } = useParams();
  const { products, getByCategory } = useProducts();
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');

  const cat = CATEGORIES.find(c => c.id === categoryId);

  // NEW ARRIVALS: show all products with badge='NEW' across every category.
  // If none are badged yet, fall back to the 8 most recently uploaded.
  const isNewArrivals = categoryId === 'new-arrivals';
  const rawProducts = isNewArrivals
    ? (() => {
        const badged = products.filter(p => p.badge === 'NEW');
        return badged.length > 0
          ? badged
          : [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
      })()
    : getByCategory(categoryId);

  // Search filter
  const searched = rawProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  const sorted = [...searched].sort((a, b) => {
    if (sortBy === 'price-asc')  return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest')     return b.id - a.id;
    return 0;
  });

  if (!cat) return (
    <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
      <h2>Category not found</h2>
      <Link to="/#collections">← Back to Collections</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '80vh', background: '#fff', color: '#1a1a1a' }}>
      <PageHeader title={cat.label} subtitle={cat.description} />

      <div className="container" style={{ padding: '3rem 2rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', fontSize: '0.78rem', color: '#aaa' }}>
          <Link to="/" style={{ color: '#aaa', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/#collections" style={{ color: '#aaa', textDecoration: 'none' }}>Collections</Link>
          <span>/</span>
          <span style={{ color: '#1a1a1a' }}>{cat.label}</span>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #ddd', padding: '0.5rem 1rem', flex: '1', maxWidth: '320px' }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#aaa" strokeWidth="1.5">
              <circle cx="8.5" cy="8.5" r="5" /><path d="M13 13L18 18" strokeLinecap="round" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${cat.label}...`}
              style={{ border: 'none', outline: 'none', fontSize: '0.85rem', fontFamily: 'var(--font-body)', width: '100%', background: 'transparent' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{sorted.length} {sorted.length === 1 ? 'product' : 'products'}</p>
            <div style={{ width: '170px', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', padding: '0.1rem 0.6rem' }}>
              <CustomSelect
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                placeholder="Sort By"
              />
            </div>
          </div>
        </div>

        {/* Category sidebar nav + products grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Other categories */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', marginBottom: '1rem' }}>Categories</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {CATEGORIES.map(c => (
                <Link
                  key={c.id}
                  to={`/collections/${c.id}`}
                  style={{
                    padding: '0.65rem 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '0.85rem',
                    color: c.id === categoryId ? '#1a1a1a' : '#888',
                    fontWeight: c.id === categoryId ? 700 : 400,
                    textDecoration: 'none',
                    letterSpacing: '0.3px',
                    transition: 'color 0.2s',
                  }}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Products */}
          <AnimatePresence mode="wait">
            {sorted.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem 0', color: '#aaa' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No products found</p>
                <p style={{ fontSize: '0.85rem' }}>{search ? 'Try a different search term.' : 'Check back soon — new drops coming.'}</p>
              </motion.div>
            ) : (
              <motion.div
                key={sortBy + search}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2.5rem 2rem' }}
              >
                {sorted.map(p => <ProductCard key={p.id} product={p} />)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*='grid-template-columns: 180px'] { grid-template-columns: 1fr !important; }
          div[style*='grid-template-columns: 180px'] > div:first-child { display: none; }
        }
      `}</style>
    </div>
  );
}
