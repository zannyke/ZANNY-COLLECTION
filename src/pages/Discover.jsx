import React from 'react';
import { motion } from 'framer-motion';

export default function Discover() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', paddingTop: '100px', fontFamily: 'var(--font-body)' }}>
      <div className="container" style={{ maxWidth: '1000px', padding: '4rem 2rem' }}>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: '1rem', textAlign: 'center' }}>
            The Brand
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', textAlign: 'center', marginBottom: '3rem', letterSpacing: '2px' }}>
            DISCOVER ZANNY
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: '100%', height: '60vh', background: '#f8f8f8', marginBottom: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '4px', color: '#ccc', marginBottom: '0.5rem' }}>ZANNY</span>
            <span style={{ fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa' }}>Visuals Coming Soon</span>
          </div>
        </motion.div>

        {/* Text Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginBottom: '6rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>Our Vision</h3>
            <p style={{ color: '#666', lineHeight: 1.8, fontSize: '0.95rem' }}>
              Zanny Collection is more than just clothing. It’s a movement built for the dreamers, the doers, and the ones on the way up. We blend high-end fashion aesthetics with raw street culture to create pieces that speak volumes without saying a word.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>The Craft</h3>
            <p style={{ color: '#666', lineHeight: 1.8, fontSize: '0.95rem' }}>
              Every stitch, every cut, and every silhouette is meticulously designed. We source premium heavy-weight cottons and durable materials because we believe true luxury is meant to be worn, lived in, and passed down. Quality is never compromised.
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
