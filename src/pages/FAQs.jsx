import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const faqs = [
  {
    question: "Do you ship internationally?",
    answer: "Yes, Zanny Collection ships worldwide. All international orders are shipped via express courier and usually arrive within 3-7 business days."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is dispatched, you will receive an email containing a tracking number and a link to monitor your shipment's progress."
  },
  {
    question: "Can I cancel or modify my order?",
    answer: "If you need to change or cancel your order, please contact us immediately. Once an order has been processed by our warehouse, we are unable to modify it."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay."
  }
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#fff', color: '#1a1a1a' }}>
      <PageHeader title="Frequently Asked Questions" />
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  padding: '1rem 0',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {faq.question}
                <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }}>
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ padding: '0 0 1rem 0', color: '#666', lineHeight: 1.6 }}>
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
