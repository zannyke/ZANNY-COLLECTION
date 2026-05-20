import React, { createContext, useContext, useState, useEffect } from 'react';

export const CATEGORIES = [
  { id: 'new-arrivals',     label: 'New Arrivals',         description: 'Fresh drops, just landed.',                fallbackImage: '/collection2.png', emoji: '✦' },
  { id: 'shirts-tees',      label: 'Shirts & T-Shirts',    description: 'Graphic tees, button-downs and essentials.', fallbackImage: '/collection1.png', emoji: '👕' },
  { id: 'hoodies',          label: 'Hoodies',              description: 'Premium heavy-cotton hoodies.',            fallbackImage: '/collection2.png', emoji: '🧥' },
  { id: 'sweaters',         label: 'Sweaters',             description: 'Cozy knits and stylish pullovers.',        fallbackImage: '/collection1.png', emoji: '🧶' },
  { id: 'shorts-sweatpants',label: 'Shorts & Sweatpants',  description: 'Comfortable bottoms for any occasion.',    fallbackImage: '/collection2.png', emoji: '👖' },
  { id: 'shoes',            label: 'Shoes',                description: 'Sneakers, boots, and everyday kicks.',     fallbackImage: '/collection1.png', emoji: '👟' },
  { id: 'innerwear',        label: 'Innerwear',            description: 'Premium basics for men.',                  fallbackImage: '/collection2.png', emoji: '🩲' },
  { id: 'accessories',      label: 'Accessories',          description: 'Caps, durags, socks and more.',            fallbackImage: '/collection1.png', emoji: '🔗' },
  { id: 'sale',             label: 'Sale',                 description: 'Premium pieces, reduced prices.',          fallbackImage: '/collection2.png', emoji: '🔥' },
];

const DEFAULT_PRODUCTS = [];

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('zanny_products');
      if (saved) {
        const custom = JSON.parse(saved);
        const ids = new Set(custom.map(p => p.id));
        return [...DEFAULT_PRODUCTS.filter(p => !ids.has(p.id)), ...custom];
      }
    } catch { /* ignore */ }
    return DEFAULT_PRODUCTS;
  });

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      badge: 'NEW',
      sold: 0,
      image: product.image || '/collection1.png',
    };
    setProducts(prev => {
      const updated = [newProduct, ...prev];
      // persist only custom products
      const custom = updated.filter(p => !DEFAULT_PRODUCTS.find(d => d.id === p.id));
      localStorage.setItem('zanny_products', JSON.stringify(custom));
      return updated;
    });
    return newProduct;
  };

  const deleteProduct = (id) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      const custom = updated.filter(p => !DEFAULT_PRODUCTS.find(d => d.id === p.id));
      localStorage.setItem('zanny_products', JSON.stringify(custom));
      return updated;
    });
  };

  const getByCategory = (categoryId) => products.filter(p => p.category === categoryId);
  const getNewArrivals = () => products.filter(p => p.badge === 'NEW');
  const getBestSellers = () => [...products].sort((a, b) => b.sold - a.sold).slice(0, 6);

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, getByCategory, getNewArrivals, getBestSellers }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
