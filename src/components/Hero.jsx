import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section style={{
      height: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }}>
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1
        }}
      />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
        zIndex: -1
      }} />

      <div style={{ textAlign: 'center', zIndex: 10, padding: '0 2rem' }}>
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 800, letterSpacing: '8px', marginBottom: '1rem', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          ZANNY
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 300 }}
        >
          The New Standard of Luxury
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          style={{ marginTop: '3rem' }}
        >
          <a href="#collections" style={{
            padding: '1rem 3rem',
            border: '1px solid #fff',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }} className="btn-outline">
            Explore Collection
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}
      >
        <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            style={{ width: '100%', height: '50%', background: '#fff' }}
          />
        </div>
      </motion.div>
      <style>{`
        .btn-outline:hover {
          background-color: #fff !important;
          color: #000 !important;
        }
      `}</style>
    </section>
  );
}
