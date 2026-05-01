import React from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#fff', color: '#1a1a1a' }}>
      <PageHeader title="Privacy Policy" />
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: '#666', lineHeight: 1.8 }}
        >
          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>1. Introduction</h2>
            <p>
              At Zanny Collection, we value your privacy and are committed to protecting your personal data. This Privacy Policy informs you about how we look after your personal data when you visit our website and tells you about your privacy rights.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>2. Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you, including Identity Data (first name, last name), Contact Data (billing address, delivery address, email address, telephone numbers), and Financial Data (payment card details).
            </p>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to process and deliver your order, manage our relationship with you, and improve our website, products/services, marketing, or customer relationships.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. Access to your personal data is limited to those employees, agents, and contractors who have a business need to know.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
