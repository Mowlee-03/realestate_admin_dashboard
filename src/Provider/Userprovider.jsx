import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create the UserContext
export const UserContext = createContext();

// Create a Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("user");
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
            } catch (error) {
                console.error("Failed to decode token:", error);
                setUser(null);
            }
        }
    }, []);

    // ✅ Function to manually update user state after login
    const login = (token) => {
        localStorage.setItem("user", token);
        setUser(jwtDecode(token)); // Update user state immediately
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
