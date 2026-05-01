import React from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

export default function ContactUs() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#fff', color: '#1a1a1a' }}>
      <PageHeader
        title="Contact Us"
        subtitle="We are here to assist you with any inquiries regarding our collections, your orders, or our services."
      />
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
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
