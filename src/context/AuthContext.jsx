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
    // Mock security: Compare base64 encoded passwords to avoid plaintext storage matching
    const encodedPassword = btoa(password);
    const foundUser = users.find(u => u.email === email && u.password === encodedPassword);
    
    if (foundUser) {
      const { password: _pw, ...userSafe } = foundUser;
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
    
    // Mock security: encode password before saving to local storage
    const newUser = { ...userData, password: btoa(userData.password), id: Date.now() };
    users.push(newUser);
    localStorage.setItem('zanny_registered_users', JSON.stringify(users));
    
    // Auto login
    const { password: _pw, ...userSafe } = newUser;
    setUser(userSafe);
    localStorage.setItem('zanny_user', JSON.stringify(userSafe));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zanny_user');
  };

  const deleteAccount = () => {
    if (user) {
      const users = JSON.parse(localStorage.getItem('zanny_registered_users') || '[]');
      const updatedUsers = users.filter(u => u.email !== user.email);
      localStorage.setItem('zanny_registered_users', JSON.stringify(updatedUsers));
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, deleteAccount, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
