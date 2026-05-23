import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, verify } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(async () => {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else if (res.needsVerification) {
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
      const res = await verify(email, verificationCode);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fff', fontFamily: 'var(--font-body)' }}>
      {/* Left side: Visual */}
      <div style={{ 
        flex: 1, background: '#111 url(/login-bg-v2.jpg) center/cover no-repeat', 
        position: 'relative' 
      }} className="hide-mobile">
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.4))' 
        }} />
        <div style={{ position: 'absolute', bottom: '4rem', left: '4rem', color: '#fff' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome Back.</h2>
          <p style={{ fontSize: '1rem', opacity: 0.8, letterSpacing: '1px' }}>Elevate your hustle with the latest drops.</p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="login-form-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '4px', fontSize: '2rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>ZANNY</h1>
            </Link>
            <p style={{ color: '#888', fontSize: '0.9rem', letterSpacing: '1px' }}>SIGN IN TO YOUR ACCOUNT</p>
          </div>

          {needsVerification ? (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: '#555', fontSize: '0.9rem', textAlign: 'center' }}>
                We sent a 6-digit verification code to <strong>{email}</strong>.
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <Mail size={18} style={{ color: '#aaa', marginRight: '0.75rem' }} />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', background: 'transparent' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <Lock size={18} style={{ color: '#aaa', marginRight: '0.75rem' }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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
                {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={16} /></>}
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
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>New to Zanny Collection?</p>
            <Link to="/register" style={{ 
              color: '#1a1a1a', textDecoration: 'none', fontSize: '0.85rem', 
              fontWeight: 700, letterSpacing: '1px', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', gap: '0.5rem' 
            }}>
              CREATE AN ACCOUNT <UserPlus size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
      <style>{`
        .login-form-container { padding: 2rem; }
        @media (max-width: 900px) {
          .hide-mobile { display: none !important; }
        }
        @media (max-width: 480px) {
          .login-form-container { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
