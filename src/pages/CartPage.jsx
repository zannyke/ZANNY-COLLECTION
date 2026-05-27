import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import PageHeader from '../components/PageHeader';
import { DELIVERY_ZONES, getDeliveryFee } from '../utils/delivery';
import CustomSelect from '../components/CustomSelect';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, clearCart, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { products } = useProducts();
  const navigate = useNavigate();

  const [selectedZone, setSelectedZone] = React.useState(user?.deliveryZone || 'kiambu');
  const deliveryFee = getDeliveryFee(selectedZone);
  const finalTotal = cartTotal + deliveryFee;

  const hasOutOfStockItems = cartItems.some(item => {
    const liveProduct = products.find(p => p.id === item.id);
    if (!liveProduct) return true;
    const variation = liveProduct.parsedVariations?.find(v => 
      v.color === item.color && (!item.size || v.size === item.size)
    );
    return !variation || Number(variation.quantity) <= 0 || item.qty > Number(variation.quantity);
  });

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '80vh', backgroundColor: '#fff' }}>
        <PageHeader title="My Cart" subtitle="Your bag is currently empty." />
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Discover our latest collections and find something you love.
          </p>
          <Link
            to="/collections"
            style={{
              display: 'inline-block',
              padding: '0.9rem 2.5rem',
              background: '#1a1a1a', color: '#fff',
              textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '2px',
              fontSize: '0.8rem', fontWeight: 600,
            }}
          >
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#fff' }}>
      <PageHeader title="My Cart" subtitle={`${cartItems.reduce((s, i) => s + i.qty, 0)} item(s) in your bag`} />

      <div className="cart-page-container container" style={{ maxWidth: '1100px' }}>
        <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>

          {/* ── Cart Items ── */}
          <div>
            <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
              <p style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Item</p>
              <p style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Subtotal</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {cartItems.map((item, idx) => {
                const liveProduct = products.find(p => p.id === item.id);
                let liveStock = 0;
                if (liveProduct && liveProduct.parsedVariations) {
                  const variation = liveProduct.parsedVariations.find(v => 
                    v.color === item.color && (!item.size || v.size === item.size)
                  );
                  if (variation) liveStock = Number(variation.quantity);
                }
                const isOutOfStock = liveStock <= 0;

                return (
                    <div
                      className="cart-item-container"
                      style={{
                        display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                        padding: '1.5rem 0', borderBottom: '1px solid #f0f0f0',
                        opacity: isOutOfStock ? 0.6 : 1,
                      }}
                    >
                    {/* Product image */}
                    <div style={{ width: '90px', height: '110px', flexShrink: 0, background: '#f8f8f8', overflow: 'hidden' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Product info */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.3rem', textDecoration: isOutOfStock ? 'line-through' : 'none' }}>{item.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>Size: <strong>{item.size}</strong></p>
                      {item.color && <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>Color: <strong>{item.color}</strong></p>}
                      
                      {isOutOfStock ? (
                        <p style={{ fontSize: '0.85rem', color: '#c0392b', marginBottom: '1rem', fontWeight: 700 }}>Out of Stock - Please remove</p>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: '#444', marginBottom: '1rem' }}>KSh {item.price.toLocaleString()} each</p>
                      )}

                      {/* Qty controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          disabled={isOutOfStock}
                          onClick={() => updateQty(item.key, item.qty - 1)}
                          style={{ width: '28px', height: '28px', border: '1px solid #ddd', background: 'none', cursor: isOutOfStock ? 'not-allowed' : 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isOutOfStock ? 0.3 : 1 }}
                        >−</button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{item.qty}</span>
                        <button
                          disabled={isOutOfStock || item.qty >= liveStock}
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          style={{ 
                            width: '28px', height: '28px', border: '1px solid #ddd', background: 'none', 
                            cursor: (isOutOfStock || item.qty >= liveStock) ? 'not-allowed' : 'pointer', 
                            fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: (isOutOfStock || item.qty >= liveStock) ? 0.3 : 1
                          }}
                        >+</button>
                        <button
                          onClick={() => removeFromCart(item.key)}
                          style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '0.75rem', letterSpacing: '0.5px', textDecoration: 'underline' }}
                        >Remove</button>
                      </div>
                    </div>

                  {/* Line subtotal */}
                  <div className="cart-item-subtotal" style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {isOutOfStock ? 'N/A' : `KSh ${(item.price * item.qty).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Clear cart */}
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={clearCart}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'underline' }}
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="order-summary-container">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1.5rem', letterSpacing: '1px' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#555' }}>
                <span>Subtotal</span>
                <span>KSh {cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimate Delivery To:</label>
                <div style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '4px', padding: '0.1rem 0.6rem' }}>
                  <CustomSelect 
                    options={DELIVERY_ZONES.map(z => ({ value: z.id, label: z.label }))}
                    value={selectedZone}
                    onChange={(val) => setSelectedZone(val)}
                    placeholder="Select Delivery Region"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#555' }}>
                <span>Shipping</span>
                <span>{deliveryFee === 0 ? 'Free' : `KSh ${deliveryFee.toLocaleString()}`}</span>
              </div>
              <div style={{ height: '1px', background: '#eee', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                <span>Total</span>
                <span>KSh {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo code */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', border: '1px solid #ddd' }}>
              <input
                type="text"
                placeholder="Promo code"
                style={{ flex: 1, padding: '0.7rem 1rem', border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent', fontFamily: 'var(--font-body)' }}
              />
              <button style={{ padding: '0.7rem 1rem', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Apply</button>
            </div>

            <motion.button
              whileTap={!hasOutOfStockItems ? { scale: 0.97 } : {}}
              disabled={hasOutOfStockItems}
              onClick={handleCheckout}
              style={{
                width: '100%', padding: '1rem',
                background: hasOutOfStockItems ? '#e0e0e0' : '#1a1a1a', 
                color: hasOutOfStockItems ? '#888' : '#fff',
                border: 'none', 
                cursor: hasOutOfStockItems ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem', fontWeight: 600, letterSpacing: '2px',
                textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                marginBottom: '1rem',
              }}
            >
              {hasOutOfStockItems ? 'Resolve Cart Errors' : 'Proceed to Checkout'}
            </motion.button>

            <Link
              to="/collections"
              style={{
                display: 'block', textAlign: 'center',
                fontSize: '0.75rem', color: '#888',
                textDecoration: 'underline', letterSpacing: '0.5px',
              }}
            >
              Continue Shopping
            </Link>

            {/* Trust badges */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['🔒 Secure Checkout', '🚚 Fast Nationwide Delivery', '↩ 30-Day Returns'].map(badge => (
                <p key={badge} style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '0.3px' }}>{badge}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
