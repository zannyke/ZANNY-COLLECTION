import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Yes, Confirm", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.98 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          style={{ 
            background: '#ffffff', 
            border: '1px solid #eee', 
            padding: '2.25rem 2rem', 
            width: '100%',
            maxWidth: '420px', 
            borderRadius: '12px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            fontFamily: 'var(--font-body)',
            textAlign: 'center'
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.75rem', color: '#1a1a1a', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {title}
          </h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            {message}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={onCancel} 
              style={{ 
                flex: 1,
                padding: '0.85rem 1rem', 
                background: 'transparent', 
                border: '1px solid #ddd', 
                borderRadius: '6px',
                color: '#444', 
                cursor: 'pointer', 
                fontSize: '0.8rem', 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                fontWeight: 600,
                transition: 'all 0.2s' 
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f9f9f9'; e.currentTarget.style.borderColor = '#ccc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#ddd'; }}
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm} 
              style={{ 
                flex: 1,
                padding: '0.85rem 1rem', 
                background: '#1a1a1a', 
                border: 'none', 
                borderRadius: '6px',
                color: '#fff', 
                cursor: 'pointer', 
                fontSize: '0.8rem', 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
