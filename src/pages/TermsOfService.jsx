import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '80vh', backgroundColor: '#fff', color: '#1a1a1a' }}>
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', textAlign: 'center', marginBottom: '4rem' }}
        >
          Terms of Service
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: '#666', lineHeight: 1.8 }}
        >
          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>1. Introduction</h2>
            <p>
              Welcome to Zanny Collection. These Terms of Service ("Terms") govern your use of our website and the purchase of our products. By accessing our website, you agree to be bound by these Terms and our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>2. Product Information and Availability</h2>
            <p>
              All products showcased on Zanny Collection are subject to availability. We reserve the right to limit the quantity of any products we offer. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. However, we cannot guarantee that your computer monitor's display of any color will be accurate.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>3. Pricing and Payments</h2>
            <p>
              Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice at any time. We accept major credit cards and other secure payment methods as indicated during the checkout process.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>4. Intellectual Property</h2>
            <p>
              All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Zanny Collection or its content suppliers and protected by international copyright laws.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>5. Limitation of Liability</h2>
            <p>
              In no case shall Zanny Collection, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
