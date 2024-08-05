import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('User data retrieved from storage:', parsedUser);
        return parsedUser;
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
      }
    } else {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);