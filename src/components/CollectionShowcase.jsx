import React from 'react';
import { motion } from 'framer-motion';

const collections = [
  {
    id: 1,
    title: 'The Signature Series',
    subtitle: 'Leather Goods',
    image: '/collection1.png',
    align: 'left'
  },
  {
    id: 2,
    title: 'Midnight Velvet',
    subtitle: 'Tailored Wear',
    image: '/collection2.png',
    align: 'right'
  }
];

export default function CollectionShowcase() {
  return (
    <section id="collections" style={{ padding: '8rem 0', backgroundColor: '#fff' }}>
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="section-title"
        >
          Curated For The Bold
        </motion.h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem', marginTop: '4rem' }}>
          {collections.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: item.align === 'left' ? 'row' : 'row-reverse',
                alignItems: 'center',
                gap: '4rem'
              }}
              className="collection-row"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ flex: 1, overflow: 'hidden' }}
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: item.align === 'left' ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ flex: 1, padding: '2rem' }}
              >
                <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.875rem', color: '#666' }}>
                  {item.subtitle}
                </span>
                <h3 style={{ fontSize: '3rem', margin: '1rem 0 2rem', fontFamily: 'var(--font-heading)' }}>
                  {item.title}
                </h3>
                <a
                  href="#"
                  style={{
                    display: 'inline-block',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #000',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'opacity 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 0.6}
                  onMouseLeave={(e) => e.target.style.opacity = 1}
                >
                  Discover the collection
                </a>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .collection-row {
            flex-direction: column !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
