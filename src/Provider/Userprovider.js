import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode

// Create the UserContext
export const UserContext = createContext();

// Create a Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
          const token = localStorage.getItem("user");          
          if (token) {
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);            
          } else {
            console.log("No token found");
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
          setUser(null);
        }
      }, []);
        
      const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
      };

    return (
        <UserContext.Provider value={{ user,logout }}>
            {children}
        </UserContext.Provider>
    );
};
