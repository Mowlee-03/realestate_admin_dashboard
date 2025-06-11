import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <== Track loading

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 < Date.now()) {
          localStorage.removeItem("user");
          setUser(null);
        } else {
          setUser(decodedUser);
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("user");
        setUser(null);
      }
    }
    setLoading(false); // <== done loading
  }, []);

  const login = (token) => {
    localStorage.setItem("user", token);
    setUser(jwtDecode(token));
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
