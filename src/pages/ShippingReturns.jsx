import React from 'react';
import { motion } from 'framer-motion';

export default function ShippingReturns() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', backgroundColor: '#fff', color: '#1a1a1a' }}>
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', textAlign: 'center', marginBottom: '4rem' }}
        >
          Shipping & Returns
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Complimentary Shipping</h2>
          <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1rem' }}>
            Zanny Collection offers complimentary standard shipping on all orders worldwide. For expedited delivery, express shipping options are available at checkout.
          </p>
          <ul style={{ color: '#666', lineHeight: 1.8, listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li>Standard Delivery: 3-5 business days</li>
            <li>Express Delivery: 1-2 business days</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Returns & Exchanges</h2>
          <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '1rem' }}>
            We gladly accept returns or exchanges within 30 days of delivery. Items must be returned in their original condition, unworn, unwashed, and with all tags attached.
          </p>
          <p style={{ color: '#666', lineHeight: 1.8 }}>
            To initiate a return, please visit our online portal or contact our Client Care team. Refunds will be issued to the original form of payment within 5-7 business days of receiving the returned item.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
