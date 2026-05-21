import React from 'react';
import { motion } from 'framer-motion';

export default function WorldOfZanny() {
  // Placeholder data for influencers/fashion trends
  const features = [
    { id: 1, title: 'Summer Campaign', subtitle: 'The Oversized Edit', size: 'large' },
    { id: 2, title: 'Street Style', subtitle: '@influencer_name', size: 'small' },
    { id: 3, title: 'Studio Sessions', subtitle: 'Behind the Scenes', size: 'small' },
    { id: 4, title: 'Night Out', subtitle: 'Tech-wear Utility', size: 'large' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', paddingTop: '100px', fontFamily: 'var(--font-body)' }}>
      <div className="container" style={{ padding: '4rem 2rem' }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: '1rem' }}>
            Fashion & Culture
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '2px' }}>
            WORLD OF ZANNY
          </h1>
          <p style={{ color: '#888', maxWidth: '500px', margin: '1.5rem auto 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Discover how the culture wears Zanny. Featuring our latest lookbooks, influencer spotlights, and community styling.
          </p>
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: '100%', minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #333', marginTop: '2rem' }}
        >
          <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '2.5rem', letterSpacing: '4px', color: '#333', marginBottom: '0.5rem' }}>COMING SOON</span>
          <span style={{ fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#666' }}>We are curating the latest looks.</span>
        </motion.div>

      </div>
    </div>
  );
}
