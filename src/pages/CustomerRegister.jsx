import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone, MapPin, ChevronDown, ArrowLeft } from 'lucide-react';
import { DELIVERY_ZONES } from '../utils/delivery';
import CustomSelect from '../components/CustomSelect';

export default function CustomerRegister() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', deliveryZone: 'kiambu' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, verify } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(async () => {
      const res = await register(form);
      if (res.success) {
        setRegisteredEmail(res.email);
        setNeedsVerification(true);
      } else {
        setError(res.message);
      }
      setLoading(false);
    }, 800);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(async () => {
      const res = await verify(registeredEmail, verificationCode);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="auth-page-container" style={{ minHeight: '100vh', display: 'flex', background: '#fff', fontFamily: 'var(--font-body)' }}>
      {/* Right side: Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
        <button 
          onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/')}
          style={{ 
            position: 'absolute', 
            top: '2rem', 
            left: '2rem', 
            color: '#1a1a1a', 
            display: 'flex', 
            alignItems: 'center', 
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            opacity: 0.6,
            transition: 'opacity 0.2s',
            zIndex: 10
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
          title="Go Back"
        >
          <ArrowLeft size={22} />
        </button>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '4px', fontSize: '2rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>ZANNY</h1>
            </Link>
            <p style={{ color: '#888', fontSize: '0.9rem', letterSpacing: '1px' }}>CREATE YOUR ACCOUNT</p>
          </div>

          {needsVerification ? (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: '#555', fontSize: '0.9rem', textAlign: 'center' }}>
                We sent a 6-digit verification code to <strong>{registeredEmail}</strong>.
              </p>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <Lock size={18} style={{ color: '#aaa', marginRight: '0.75rem' }} />
                  <input 
                    type="text" 
                    placeholder="6-digit Code" 
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    required
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1.5rem', letterSpacing: '4px', textAlign: 'center', background: 'transparent' }}
                  />
                </div>
                {error && <p style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: '0.5rem' }}>{error}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  background: '#1a1a1a', color: '#fff', border: 'none', padding: '1rem', 
                  fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', 
                  textTransform: 'uppercase', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginTop: '1rem'
                }}
              >
                {loading ? 'Verifying...' : <>Verify Email <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="register-names-row" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <input 
                    name="firstName"
                    placeholder="First Name" 
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', background: 'transparent' }}
                  />
                </div>
                <div style={{ flex: 1, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <input 
                    name="lastName"
                    placeholder="Last Name" 
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', background: 'transparent' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <Phone size={18} style={{ color: '#aaa', marginRight: '0.75rem' }} />
                  <input 
                    name="phone"
                    type="tel" 
                    placeholder="Phone Number" 
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', background: 'transparent' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', position: 'relative' }}>
                  <MapPin size={18} style={{ color: '#aaa', marginRight: '0.75rem', flexShrink: 0 }} />
                  <CustomSelect 
                    options={DELIVERY_ZONES.map(z => ({ value: z.id, label: z.label, shortLabel: z.shortLabel }))}
                    value={form.deliveryZone}
                    onChange={(val) => setForm({ ...form, deliveryZone: val })}
                    placeholder="Select Delivery Region"
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <Mail size={18} style={{ color: '#aaa', marginRight: '0.75rem' }} />
                  <input 
                    name="email"
                    type="email" 
                    placeholder="Email Address" 
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', background: 'transparent' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <Lock size={18} style={{ color: '#aaa', marginRight: '0.75rem' }} />
                  <input 
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', background: 'transparent' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.5rem', color: '#888' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && <p style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: '0.5rem' }}>{error}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  background: '#1a1a1a', color: '#fff', border: 'none', padding: '1rem', 
                  fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', 
                  textTransform: 'uppercase', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginTop: '1rem'
                }}
              >
                {loading ? 'Creating Account...' : <>Join the Collection <ArrowRight size={16} /></>}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
              </div>

              <a 
                href="/api/auth/google"
                style={{ 
                  background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', padding: '1rem', 
                  fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', 
                  textTransform: 'uppercase', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  textDecoration: 'none'
                }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
                Continue with Google
              </a>
            </form>
          )}

          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #f5f5f5', paddingTop: '2rem' }}>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>Already have an account?</p>
            <Link to="/login" style={{ 
              color: '#1a1a1a', textDecoration: 'none', fontSize: '0.85rem', 
              fontWeight: 700, letterSpacing: '1px'
            }}>
              SIGN IN HERE
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Left side: Visual */}
      <div style={{ 
        flex: 1, background: '#111 url(/register-bg-v2.jpg) center/cover no-repeat', 
        position: 'relative' 
      }} className="hide-mobile">
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.4))' 
        }} />
        <div style={{ position: 'absolute', bottom: '4rem', right: '4rem', color: '#fff', textAlign: 'right' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '1rem' }}>Join the Movement.</h2>
          <p style={{ fontSize: '1rem', opacity: 0.8, letterSpacing: '1px' }}>Unlock early access and exclusive deals.</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
