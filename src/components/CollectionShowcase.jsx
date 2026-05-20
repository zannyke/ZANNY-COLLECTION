import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../context/ProductContext';
import { useProducts } from '../context/ProductContext';

export default function CollectionShowcase() {
  const { products } = useProducts();

  return (
    <section id="collections" style={{ backgroundColor: '#fff', paddingBottom: '6rem' }}>
      {/* Section header */}
      <div style={{ padding: '5rem 2rem 3rem', textAlign: 'center' }}>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontSize: '0.75rem', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', marginBottom: '0.75rem' }}
        >
          Shop by Category
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '0.75rem' }}
        >
          Explore the Collection
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{ color: '#888', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}
        >
          From streetwear staples to avant-garde edge — explore every Zanny category.
        </motion.p>
      </div>

      {/* Category Grid */}
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {CATEGORIES.map((cat, i) => {
            let latestProduct;
            if (cat.id === 'new-arrivals') {
              latestProduct = products.filter(p => p.badge === 'NEW').sort((a, b) => b.id - a.id)[0];
            } else if (cat.id === 'sale') {
              latestProduct = products.filter(p => p.badge === 'SALE' || p.discount).sort((a, b) => b.id - a.id)[0];
            } else {
              latestProduct = products.filter(p => p.category === cat.id).sort((a, b) => b.id - a.id)[0];
            }
            
            // Count: new-arrivals = NEW badge, sale = SALE badge, others = by category
            const count = cat.id === 'new-arrivals'
              ? products.filter(p => p.badge === 'NEW').length
              : cat.id === 'sale'
              ? products.filter(p => p.badge === 'SALE').length
              : products.filter(p => p.category === cat.id).length;
            const displayImage = latestProduct?.image || cat.fallbackImage;
            
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              >
                <Link
                  to={`/collections/${cat.id}`}
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    {/* Category image */}
                    <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: '#f4f4f4' }}>
                      {displayImage ? (
                        <motion.img
                          whileHover={{ scale: 1.07 }}
                          transition={{ duration: 0.6 }}
                          src={displayImage}
                          alt={cat.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4' }}>
                          <span style={{ color: '#aaa', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase' }}>ZANNY</span>
                        </div>
                      )}
                      {/* Dark overlay on hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <span style={{
                          color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                          letterSpacing: '2px', textTransform: 'uppercase',
                          border: '1px solid rgba(255,255,255,0.7)',
                          padding: '0.6rem 1.5rem',
                        }}>Shop Now</span>
                      </motion.div>
                    </div>

                    {/* Category info */}
                    <div style={{ padding: '1rem 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                          {cat.label}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#aaa', letterSpacing: '0.5px' }}>
                          {count} {count === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>{cat.description}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
