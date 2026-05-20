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

        {/* Masonry-style Grid Placeholder */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map((feature, i) => (
            <motion.div 
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: '#1a1a1a', 
                minHeight: feature.size === 'large' ? '500px' : '300px',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '2rem', border: '1px solid #333',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {/* This is where the user will eventually map real images from the database */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '5rem', letterSpacing: '10px' }}>ZANNY</span>
              </div>
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <p style={{ color: '#888', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {feature.subtitle}
                </p>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', letterSpacing: '1px' }}>
                  {feature.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
          <p style={{ color: '#666', fontSize: '0.85rem', letterSpacing: '1px' }}>More editorials coming soon. Tag us on socials to be featured.</p>
        </div>

      </div>
    </div>
  );
}
