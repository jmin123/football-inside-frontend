import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (isLoggedIn) {
        try {
          const response = await api.get('/auth/check');
          if (response.status === 200) {
            setUser(response.data);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
          logout();
        }
      }
    };

    checkLoginStatus();
  }, [isLoggedIn]);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);