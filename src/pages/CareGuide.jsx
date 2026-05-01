import React from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

export default function CareGuide() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#fff', color: '#1a1a1a' }}>
      <PageHeader title="Care Guide" />
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Leather Goods</h2>
          <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1rem' }}>
            To preserve the beauty and quality of your Zanny leather goods, avoid exposure to direct sunlight, heat, and moisture. 
            If the leather gets wet, dab it dry with a soft, light-colored cloth. Store your items in their original dust bag when not in use.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Tailored Wear</h2>
          <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1rem' }}>
            Our garments are crafted from delicate, high-quality fabrics. Always refer to the care label attached to the garment. 
            We recommend professional dry cleaning for all tailored pieces. Store suits and coats on proper wooden hangers to maintain their shape.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Jewelry</h2>
          <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1rem' }}>
            Protect your jewelry from water, perfume, and cosmetic products. After each wear, gently wipe your piece with a soft cloth 
            and store it separately in its pouch or box to prevent scratching.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
