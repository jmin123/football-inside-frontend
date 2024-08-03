import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('User data retrieved from localStorage:', parsedUser);
        return parsedUser;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);