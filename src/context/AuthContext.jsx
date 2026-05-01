import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('zanny_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('zanny_registered_users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userSafe } = foundUser;
      setUser(userSafe);
      localStorage.setItem('zanny_user', JSON.stringify(userSafe));
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('zanny_registered_users') || '[]');
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email already exists' };
    }
    
    const newUser = { ...userData, id: Date.now() };
    users.push(newUser);
    localStorage.setItem('zanny_registered_users', JSON.stringify(users));
    
    // Auto login
    const { password, ...userSafe } = newUser;
    setUser(userSafe);
    localStorage.setItem('zanny_user', JSON.stringify(userSafe));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zanny_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
