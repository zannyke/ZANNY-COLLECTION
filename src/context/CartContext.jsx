import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();


export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('zanny_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('zanny_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size = 'M') => {
    setCartItems(prev => {
      const key = `${product.id}-${size}`;
      const exists = prev.find(i => i.key === key);
      if (exists) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, size, qty: 1, key }];
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
