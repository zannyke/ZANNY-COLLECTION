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
          // Normalize properties for frontend rendering to prevent undefined values crashing Recharts
          setProducts(data.map(p => {
            let parsedVariations = [];
            let parsedGallery = [];
            try { if (p.variations) parsedVariations = JSON.parse(p.variations); } catch(e) {}
            try { if (p.gallery_urls) parsedGallery = JSON.parse(p.gallery_urls); } catch(e) {}
            return { 
              ...p, 
              image: p.image_url || '',
              sold: p.sold || 0,
              price: Number(p.price) || 0,
              stock: Number(p.stock) || 0,
              parsedVariations,
              parsedGallery
            };
          }));
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

  const addProduct = async (product, file, galleryFiles = []) => {
    let imageUrl = '';
    let galleryUrls = [];

    // Upload to R2 if file exists
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) { imageUrl = uploadData.url; }
      } catch (err) { console.error("Image upload failed", err); }
    }

    // Upload gallery files
    if (galleryFiles && galleryFiles.length > 0) {
      for (const gFile of galleryFiles) {
        const formData = new FormData();
        formData.append('file', gFile);
        try {
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
          const uploadData = await uploadRes.json();
          if (uploadData.success) { galleryUrls.push(uploadData.url); }
        } catch (err) { console.error("Gallery upload failed", err); }
      }
    }

    // Save to D1
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, image: imageUrl, gallery_urls: galleryUrls })
      });
      const data = await res.json();
      if (data.success && data.id) {
        const newProd = {
          ...product,
          id: data.id,
          image: imageUrl,
          image_url: imageUrl,
          sold: 0,
          created_at: new Date().toISOString()
        };
        setProducts(prev => [newProd, ...prev]);
        return newProd;  // success — has .id
      }
      // Return the error object so the UI can display it
      return { error: data.error || 'Database insert failed' };
    } catch (err) {
      console.error('Database insert failed', err);
      return { error: err.message };
    }
  };

  const editProduct = async (id, updatedData, file, galleryFiles = []) => {
    let imageUrl = updatedData.image_url || updatedData.image; // Keep existing if no new file
    let galleryUrls = updatedData.parsedGallery || [];

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) { imageUrl = uploadData.url; }
      } catch (err) { console.error("Image upload failed", err); }
    }

    // Upload new gallery files
    if (galleryFiles && galleryFiles.length > 0) {
      const newUrls = [];
      for (const gFile of galleryFiles) {
        const formData = new FormData();
        formData.append('file', gFile);
        try {
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
          const uploadData = await uploadRes.json();
          if (uploadData.success) { newUrls.push(uploadData.url); }
        } catch (err) { console.error("Gallery upload failed", err); }
      }
      galleryUrls = [...galleryUrls, ...newUrls];
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedData, image_url: imageUrl, gallery_urls: galleryUrls })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => {
          if (p.id === id) {
            let parsedVariations = [];
            let parsedGallery = galleryUrls;
            try { if (updatedData.variations) parsedVariations = JSON.parse(updatedData.variations); } catch(e) {}
            return { ...p, ...updatedData, image: imageUrl, image_url: imageUrl, parsedVariations, parsedGallery };
          }
          return p;
        }));
        return { success: true };
      }
      return { error: data.error || 'Update failed' };
    } catch (err) {
      console.error('Database update failed', err);
      return { error: err.message };
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
    <ProductContext.Provider value={{ products, loading, addProduct, editProduct, deleteProduct, getByCategory, getNewArrivals, getBestSellers }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
