import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("user");
        if (token) {
            try {
                const decodedUser = jwtDecode(token);

                // ✅ Expiry check
                if (decodedUser.exp * 1000 < Date.now()) {
                    localStorage.removeItem("user"); // Remove expired token
                    setUser(null); 
                } else {
                    setUser(decodedUser); // Set valid user data
                }
            } catch (error) {
                console.error("Failed to decode token:", error);
                localStorage.removeItem("user"); // Clear invalid token
                setUser(null);
            }
        }
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
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
