import React, { createContext, useContext, useState, useEffect } from 'react';

export const CATEGORIES = [
  { id: 'new-arrivals',  label: 'New Arrivals',       description: 'Fresh drops, just landed.',                image: '/collection2.png', emoji: '✦' },
  { id: 'tops-tees',     label: 'Tops & Tees',         description: 'Graphic tees, essentials & statement tops.', image: '/collection1.png', emoji: '👕' },
  { id: 'hoodies',       label: 'Hoodies & Sweats',    description: 'Comfort meets edge.',                      image: '/collection2.png', emoji: '🧥' },
  { id: 'outerwear',     label: 'Outerwear',            description: 'Jackets, coats and statement layers.',     image: '/collection1.png', emoji: '🧣' },
  { id: 'bottoms',       label: 'Bottoms',              description: 'Cargos, joggers and tailored cuts.',       image: '/collection2.png', emoji: '👖' },
  { id: 'accessories',   label: 'Accessories',          description: 'Caps, chains and finishing touches.',      image: '/collection1.png', emoji: '🔗' },
  { id: 'tech-wear',     label: 'Tech-Wear',            description: 'The future of street-functional fashion.', image: '/collection2.png', emoji: '⚡' },
  { id: 'sale',          label: 'Sale',                 description: 'Premium pieces, reduced prices.',          image: '/collection1.png', emoji: '🔥' },
];

const DEFAULT_PRODUCTS = [
  { id: 1,  name: 'Zenith Oversized Tee',  category: 'tops-tees',    price: 2800, badge: 'NEW',  image: '/collection1.png', description: 'Ultra-soft 100% cotton oversized tee. A Zanny classic.', stock: 42, sold: 87 },
  { id: 2,  name: 'Avant-Garde Hoodie',    category: 'hoodies',      price: 5500, badge: '',     image: '/collection2.png', description: 'Heavyweight fleece hoodie with dropped shoulders.',      stock: 28, sold: 63 },
  { id: 3,  name: 'Nexus Cargo Pants',     category: 'bottoms',      price: 4200, badge: 'HOT',  image: '/collection1.png', description: 'Tactical cargo pants with a sharp, fashionable edge.',   stock: 19, sold: 55 },
  { id: 4,  name: 'Now Series Jacket',     category: 'outerwear',    price: 8900, badge: 'NEW',  image: '/collection2.png', description: 'Trend-forward bomber jacket for the urban explorer.',     stock: 14, sold: 38 },
  { id: 5,  name: 'Youthquake Cap',        category: 'accessories',  price: 1800, badge: '',     image: '/collection1.png', description: 'Structured 6-panel cap with Zanny embroidery.',           stock: 60, sold: 102 },
  { id: 6,  name: 'Z-Tech Windbreaker',    category: 'tech-wear',    price: 9500, badge: 'NEW',  image: '/collection2.png', description: 'Waterproof tech-wear shell. Built for Nairobi rains.',   stock: 11, sold: 29 },
  { id: 7,  name: 'Urban Crew Neck',       category: 'hoodies',      price: 3800, badge: '',     image: '/collection1.png', description: 'French terry crew neck with ribbed cuffs.',              stock: 33, sold: 47 },
  { id: 8,  name: 'Nairobi Street Tee',    category: 'tops-tees',    price: 2200, badge: 'SALE', image: '/collection2.png', description: 'Nairobi-inspired graphic tee. Limited run.',              stock: 55, sold: 91 },
  { id: 9,  name: 'Edge Slim Joggers',     category: 'bottoms',      price: 3500, badge: '',     image: '/collection1.png', description: 'Tapered joggers with side zip details.',                 stock: 24, sold: 44 },
  { id: 10, name: 'Zanny Chain Link',      category: 'accessories',  price: 2500, badge: 'HOT',  image: '/collection2.png', description: 'Stainless steel chain link necklace.',                   stock: 80, sold: 119 },
  { id: 11, name: 'Avant Puffer Vest',     category: 'outerwear',    price: 6800, badge: 'SALE', image: '/collection1.png', description: 'Lightweight puffer vest — insulated and packable.',      stock: 16, sold: 33 },
  { id: 12, name: 'Zenith Drop Shoulder',  category: 'new-arrivals', price: 3200, badge: 'NEW',  image: '/collection2.png', description: 'Drop-shoulder silhouette tee with raw hem detailing.',   stock: 40, sold: 22 },
];

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
