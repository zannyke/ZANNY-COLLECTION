import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { User, LogOut, Trash2, PlusCircle } from 'lucide-react';

export default function AccountPage() {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      deleteAccount();
      navigate('/');
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-body)', paddingBottom: '4rem' }}>
      <PageHeader title="My Account" subtitle="Manage your profile, preferences, and security." />
      
      <div className="container" style={{ maxWidth: '800px', marginTop: '3rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', border: '1px solid #eee', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Profile Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '2rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#1a1a1a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem',
            }}>
              {user.firstName[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', margin: 0, textTransform: 'uppercase' }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ color: '#888', margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                <User size={14} /> {user.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.5rem' }}>Account Settings</h3>
            
            <button 
              onClick={() => navigate('/register')}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem', background: '#f9f9f9', border: '1px solid #eee',
                cursor: 'pointer', textAlign: 'left', color: '#1a1a1a', fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
            >
              <PlusCircle size={18} color="#555" />
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 600 }}>Add Another Account</span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Register a new profile for exclusive discounts.</span>
              </div>
            </button>

            <button 
              onClick={handleSignOut}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem', background: '#f9f9f9', border: '1px solid #eee',
                cursor: 'pointer', textAlign: 'left', color: '#1a1a1a', fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={18} color="#555" />
              <span style={{ fontWeight: 600 }}>Sign Out</span>
            </button>

            <button 
              onClick={handleDelete}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem', background: '#fff5f5', border: '1px solid #ffebeb',
                cursor: 'pointer', textAlign: 'left', color: '#c0392b', fontSize: '0.95rem',
                marginTop: '1rem', transition: 'all 0.2s'
              }}
            >
              <Trash2 size={18} />
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 600 }}>Delete Account</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Permanently remove your data from our system.</span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
