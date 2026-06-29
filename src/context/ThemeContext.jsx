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

  // Design Tokens for Admin (Monochromatic luxury streetwear theme matching the main website)
  const colors = {
    dark: {
      bg: '#000000',
      surface: '#121212',
      surfaceHover: '#1c1c1e',
      border: '#242426',
      text: '#ffffff',
      textMuted: '#a1a1a6',
      accent: '#ffffff',
      sidebar: '#121212',
      sidebarText: '#8e8e93',
      sidebarTextActive: '#ffffff',
      sidebarHover: '#1c1c1e',
      input: '#1e1e1f',
    },
    light: {
      bg: '#f8f8f8',
      surface: '#ffffff',
      surfaceHover: '#f0f0f0',
      border: '#e5e5e7',
      text: '#1a1a1a',
      textMuted: '#6e6e73',
      accent: '#1a1a1a',
      sidebar: '#ffffff',
      sidebarText: '#86868b',
      sidebarTextActive: '#1a1a1a',
      sidebarHover: '#f5f5f7',
      input: '#f5f5f7',
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
