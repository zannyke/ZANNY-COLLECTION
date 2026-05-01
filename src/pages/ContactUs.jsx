import React from 'react';
import { motion } from 'framer-motion';

export default function ContactUs() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', backgroundColor: '#fff', color: '#1a1a1a' }}>
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}
        >
          Contact Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ textAlign: 'center', color: '#666', marginBottom: '4rem' }}
        >
          We are here to assist you with any inquiries regarding our collections, your orders, or our services.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          <div style={{ display: 'flex', gap: '2rem' }} className="contact-row">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>First Name</label>
              <input type="text" style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Last Name</label>
              <input type="text" style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
            <input type="email" style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Message</label>
            <textarea rows="5" style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', fontSize: '1rem', resize: 'vertical' }}></textarea>
          </div>
          <button type="button" style={{
            padding: '1rem 2rem',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: 'none',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
          >
            Send Message
          </button>
        </motion.form>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .contact-row { flex-direction: column; gap: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
