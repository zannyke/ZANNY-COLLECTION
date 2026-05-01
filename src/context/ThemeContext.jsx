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
      bg: '#0e0e0e',
      surface: '#181818',
      surfaceHover: '#1e1e1e',
      border: '#2a2a2a',
      text: '#ffffff',
      textMuted: '#666666',
      accent: '#00ff9d',
      sidebar: '#111111',
      input: '#111111',
    },
    light: {
      bg: '#f8f9fa',
      surface: '#ffffff',
      surfaceHover: '#f1f3f5',
      border: '#dee2e6',
      text: '#1a1a1a',
      textMuted: '#868e96',
      accent: '#00b894',
      sidebar: '#ffffff',
      input: '#f1f3f5',
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
