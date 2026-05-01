import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CATEGORIES = [
  { id: 'new-arrivals',  label: 'New Arrivals',       emoji: '✦' },
  { id: 'tops-tees',     label: 'Tops & Tees',         emoji: '👕' },
  { id: 'hoodies',       label: 'Hoodies & Sweats',    emoji: '🧥' },
  { id: 'outerwear',     label: 'Outerwear',            emoji: '🧣' },
  { id: 'bottoms',       label: 'Bottoms',              emoji: '👖' },
  { id: 'accessories',   label: 'Accessories',          emoji: '🔗' },
  { id: 'tech-wear',     label: 'Tech-Wear',            emoji: '⚡' },
  { id: 'sale',          label: 'Sale',                 emoji: '🔥' },
];

export const PRODUCTS = [
  { id: 1, name: 'Zenith Oversized Tee',    category: 'tops-tees',   price: 2800,  badge: 'NEW',  image: '/collection1.png' },
  { id: 2, name: 'Avant-Garde Hoodie',      category: 'hoodies',     price: 5500,  badge: '',     image: '/collection2.png' },
  { id: 3, name: 'Nexus Cargo Pants',       category: 'bottoms',     price: 4200,  badge: 'HOT',  image: '/collection1.png' },
  { id: 4, name: 'Now Series Jacket',       category: 'outerwear',   price: 8900,  badge: 'NEW',  image: '/collection2.png' },
  { id: 5, name: 'Youthquake Cap',          category: 'accessories', price: 1800,  badge: '',     image: '/collection1.png' },
  { id: 6, name: 'Z-Tech Windbreaker',      category: 'tech-wear',   price: 9500,  badge: 'NEW',  image: '/collection2.png' },
  { id: 7, name: 'Urban Crew Neck',         category: 'hoodies',     price: 3800,  badge: '',     image: '/collection1.png' },
  { id: 8, name: 'Nairobi Street Tee',      category: 'tops-tees',   price: 2200,  badge: 'SALE', image: '/collection2.png' },
  { id: 9, name: 'Edge Slim Joggers',       category: 'bottoms',     price: 3500,  badge: '',     image: '/collection1.png' },
  { id: 10, name: 'Zanny Chain Link',       category: 'accessories', price: 2500,  badge: 'HOT',  image: '/collection2.png' },
  { id: 11, name: 'Avant Puffer Vest',      category: 'outerwear',   price: 6800,  badge: 'SALE', image: '/collection1.png' },
  { id: 12, name: 'Zenith Drop Shoulder',   category: 'new-arrivals',price: 3200,  badge: 'NEW',  image: '/collection2.png' },
];

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
