import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zanny_admin_theme') || 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState('dark');

  useEffect(() => {
    localStorage.setItem('zanny_admin_theme', theme);
    
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const update = () => setResolvedTheme(media.matches ? 'dark' : 'light');
      update();
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  // Design Tokens for Admin
  const colors = {
    dark: {
      bg: '#0b1437',
      surface: '#111c44',
      surfaceHover: '#1b2a68',
      border: '#1b2c66',
      text: '#ffffff',
      textMuted: '#a3aed0',
      accent: '#00ff9d',
      sidebar: '#111c44',
      sidebarText: '#a3aed0',
      sidebarTextActive: '#ffffff',
      sidebarHover: '#1b2a68',
      input: '#0b1437',
    },
    light: {
      bg: '#f4f7fe',
      surface: '#ffffff',
      surfaceHover: '#f4f7fe',
      border: '#e0e5f2',
      text: '#1b254b',
      textMuted: '#a3aed0',
      accent: '#05cd99', // Emerald/Forest green
      sidebar: '#0b2545', // Dark Navy Blue sidebar
      sidebarText: '#8ca3d4',
      sidebarTextActive: '#ffffff',
      sidebarHover: '#133b6e',
      input: '#f4f7fe',
    }
  };

  const t = colors[resolvedTheme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
