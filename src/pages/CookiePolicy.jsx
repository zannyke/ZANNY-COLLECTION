import React from 'react';
import { motion } from 'framer-motion';

export default function CookiePolicy() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', backgroundColor: '#fff', color: '#1a1a1a' }}>
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', textAlign: 'center', marginBottom: '4rem' }}
        >
          Cookie Policy
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: '#666', lineHeight: 1.8 }}
        >
          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us remember your actions and preferences (such as login details, language, font size, and other display preferences) over a period of time.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>2. How We Use Cookies</h2>
            <p>
              Zanny Collection uses cookies to ensure our website functions correctly, to personalize your experience, to analyze traffic, and for targeted advertising. We use both session cookies (which expire when you close your browser) and persistent cookies (which stay on your device for a set period).
            </p>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>3. Types of Cookies We Use</h2>
            <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Essential Cookies:</strong> Required for the basic functioning of our website, such as managing your shopping cart and secure checkout.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Performance & Analytics Cookies:</strong> Allow us to recognize and count visitors and see how they move around our site.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Functionality Cookies:</strong> Used to recognize you when you return to our website, enabling personalized content.</li>
              <li><strong>Targeting Cookies:</strong> Record your visit, the pages you visited, and links you followed to make advertising more relevant to your interests.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>4. Managing Your Cookie Preferences</h2>
            <p>
              You can control and manage cookies through your browser settings. Please note that removing or blocking cookies can impact your user experience, and some functionality of our website may no longer be available to you.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
