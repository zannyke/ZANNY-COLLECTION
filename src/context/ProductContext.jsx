import React, { createContext, useContext, useState, useEffect } from 'react';

export const CATEGORIES = [
  { id: 'new-arrivals',  label: 'New Arrivals',       description: 'Fresh drops, just landed.',                image: '/cat_new_arrivals.png', emoji: '✦' },
  { id: 'tops-tees',     label: 'Tops & Tees',         description: 'Graphic tees, essentials & statement tops.', image: '/cat_tops_tees.png', emoji: '👕' },
  { id: 'hoodies',       label: 'Hoodies & Sweats',    description: 'Comfort meets edge.',                      image: '/cat_hoodies.png', emoji: '🧥' },
  { id: 'outerwear',     label: 'Outerwear',            description: 'Jackets, coats and statement layers.',     image: '/cat_outerwear.png', emoji: '🧣' },
  { id: 'bottoms',       label: 'Bottoms',              description: 'Cargos, joggers and tailored cuts.',       image: '/cat_bottoms.png', emoji: '👖' },
  { id: 'accessories',   label: 'Accessories',          description: 'Caps, chains and finishing touches.',      image: '/cat_accessories.png', emoji: '🔗' },
  { id: 'tech-wear',     label: 'Tech-Wear',            description: 'The future of street-functional fashion.', image: '/cat_tech_wear.png', emoji: '⚡' },
  { id: 'sale',          label: 'Sale',                 description: 'Premium pieces, reduced prices.',          image: '/cat_sale.png', emoji: '🔥' },
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
