import React, { createContext, useContext, useState, useEffect } from 'react';

export const CATEGORIES = [
  { id: 'new-arrivals',     label: 'New Arrivals',         description: 'Fresh drops, just landed.',                fallbackImage: '', emoji: '✦' },
  { id: 'shirts-tees',      label: 'Shirts & T-Shirts',    description: 'Graphic tees, button-downs and essentials.', fallbackImage: '', emoji: '👕' },
  { id: 'hoodies',          label: 'Hoodies',              description: 'Premium heavy-cotton hoodies.',            fallbackImage: '', emoji: '🧥' },
  { id: 'sweaters',         label: 'Sweaters',             description: 'Cozy knits and stylish pullovers.',        fallbackImage: '', emoji: '🧶' },
  { id: 'shorts-sweatpants',label: 'Shorts & Sweatpants',  description: 'Comfortable bottoms for any occasion.',    fallbackImage: '', emoji: '👖' },
  { id: 'shoes',            label: 'Shoes',                description: 'Sneakers, boots, and everyday kicks.',     fallbackImage: '', emoji: '👟' },
  { id: 'innerwear',        label: 'Innerwear',            description: 'Premium basics for men.',                  fallbackImage: '', emoji: '🩲' },
  { id: 'accessories',      label: 'Accessories',          description: 'Caps, durags, socks and more.',            fallbackImage: '', emoji: '🔗' },
  { id: 'sale',             label: 'Sale',                 description: 'Premium pieces, reduced prices.',          fallbackImage: '', emoji: '🔥' },
];

const DEFAULT_PRODUCTS = [];

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from D1 API on load
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Normalize the key from image_url to image for our frontend
          setProducts(data.map(p => ({ ...p, image: p.image_url || '' })));
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const addProduct = async (product, file) => {
    let imageUrl = '';

    // Upload to R2 if file exists
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    // Save to D1
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, image: imageUrl })
      });
      if (res.ok) {
        const data = await res.json();
        const newProd = {
          ...product,
          id: data.id,
          image: imageUrl,
          created_at: new Date().toISOString()
        };
        setProducts(prev => [newProd, ...prev]);
        return newProd;
      }
    } catch (err) {
      console.error("Database insert failed", err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const getByCategory = (categoryId) => products.filter(p => p.category === categoryId);
  const getNewArrivals = () => products.filter(p => p.badge === 'NEW');
  const getBestSellers = () => [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 6);

  return (
    <ProductContext.Provider value={{ products, loading, addProduct, deleteProduct, getByCategory, getNewArrivals, getBestSellers }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
