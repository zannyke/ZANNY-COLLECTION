import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

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

  // Sync cart from database when logging in, merge items if necessary
  useEffect(() => {
    const syncCartOnLogin = async () => {
      // User just logged in
      if (user && !prevUserRef.current) {
        try {
          const res = await fetch('/api/cart');
          const data = await res.json();
          if (data.success) {
            const dbItems = data.items;
            
            // Merge database cart with local cart
            setCartItems(localItems => {
              const merged = [...localItems];
              dbItems.forEach(dbItem => {
                const existsIdx = merged.findIndex(i => i.id === dbItem.id && i.color === dbItem.color && i.size === dbItem.size);
                if (existsIdx > -1) {
                  // Keep the larger quantity or sum them up
                  merged[existsIdx].qty = Math.max(merged[existsIdx].qty, dbItem.qty);
                } else {
                  merged.push(dbItem);
                }
              });
              return merged;
            });
          }
        } catch (err) {
          console.error("Failed to sync cart from database", err);
        }
      } 
      // User just logged out: Clear cart
      else if (!user && prevUserRef.current) {
        setCartItems([]);
      }
      prevUserRef.current = user;
    };

    syncCartOnLogin();
  }, [user]);

  // Sync state changes back to database (if logged in) or localStorage (if guest)
  useEffect(() => {
    localStorage.setItem('zanny_cart', JSON.stringify(cartItems));

    if (user) {
      // Throttle or simply push the updated cart to backend API
      const pushCartToDB = async () => {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cartItems })
          });
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
    setCartItems(prev => prev.filter(i => i.key !== key));
  };

  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key);
    setCartItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
