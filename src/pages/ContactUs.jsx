import React from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

export default function ContactUs() {
  const [formData, setFormData] = React.useState({ firstName: '', lastName: '', email: '', message: '' });
  const [status, setStatus] = React.useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to send message');
      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#fff', color: '#1a1a1a' }}>
      <PageHeader
        title="Contact Us"
        subtitle="We are here to assist you with any inquiries regarding our collections, your orders, or our services."
      />
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {status === 'success' && (
            <div style={{ padding: '1rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '4px', textAlign: 'center' }}>
              Your message has been sent successfully! We will get back to you soon.
            </div>
          )}
          {errorMsg && (
            <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '4px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '2rem' }} className="contact-row">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>First Name</label>
              <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Last Name</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Message</label>
            <textarea rows="5" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', outline: 'none', fontSize: '1rem', resize: 'vertical' }}></textarea>
          </div>
          <button type="submit" disabled={status === 'loading'} style={{
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
          onMouseEnter={(e) => { if (status !== 'loading') e.target.style.backgroundColor = '#333'; }}
          onMouseLeave={(e) => { if (status !== 'loading') e.target.style.backgroundColor = '#1a1a1a'; }}
          >
            {status === 'loading' ? 'Sending...' : 'Send Message'}
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
