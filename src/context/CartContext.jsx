import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { resolveImageUrl } from './ProductContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('zanny_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Track user login state transitions
  const prevUserRef = useRef(user);
  const isUpdatingFromDbRef = useRef(false);
  const isLocalChangeRef = useRef(false);

  // Sync cart from database when logging in, or periodically poll for changes
  useEffect(() => {
    const fetchCartFromDB = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        if (data.success) {
          isUpdatingFromDbRef.current = true;
          const normalized = (data.items || []).map(item => ({
            ...item,
            key: `${item.id}-${item.color || ''}-${item.size || ''}`,
            image: resolveImageUrl(item.image)
          }));
          setCartItems(normalized);
          setTimeout(() => {
            isUpdatingFromDbRef.current = false;
          }, 100);
        }
      } catch (err) {
        console.error("Failed to sync cart from database", err);
      }
    };

    if (user) {
      fetchCartFromDB();

      // Poll every 5 seconds for live cart synchronization across devices
      const interval = setInterval(fetchCartFromDB, 5000);
      return () => clearInterval(interval);
    } else if (!user && prevUserRef.current) {
      setCartItems([]);
    }
    prevUserRef.current = user;
  }, [user]);

  // Sync state changes back to database (if logged in) or localStorage (if guest)
  useEffect(() => {
    localStorage.setItem('zanny_cart', JSON.stringify(cartItems));

    if (user && !isUpdatingFromDbRef.current && isLocalChangeRef.current) {
      // Throttle or simply push the updated cart to backend API
      const pushCartToDB = async () => {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cartItems })
          });
          isLocalChangeRef.current = false;
        } catch (err) {
          console.error("Failed to sync cart changes to database", err);
        }
      };
      
      // Delay slightly to prevent rapid multiple fetch calls during fast item actions
      const delayDebounce = setTimeout(() => {
        pushCartToDB();
      }, 300);

      return () => clearTimeout(delayDebounce);
    }
  }, [cartItems, user]);

  const addToCart = (product, size = '', color = '') => {
    isLocalChangeRef.current = true;
    setCartItems(prev => {
      const key = `${product.id}-${color}-${size}`;
      const exists = prev.find(i => i.key === key);
      if (exists) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, size, color, qty: 1, key }];
    });
  };

  const removeFromCart = (key) => {
    isLocalChangeRef.current = true;
    setCartItems(prev => prev.filter(i => i.key !== key));
  };

  const updateQty = (key, qty) => {
    isLocalChangeRef.current = true;
    if (qty < 1) return removeFromCart(key);
    setCartItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };

  const clearCart = () => {
    isLocalChangeRef.current = true;
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
