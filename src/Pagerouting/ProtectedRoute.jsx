import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Provider/Userprovider';

const ProtectedRoute = ({ children }) => {
  const {user} = useContext(UserContext);
  console.log(user)
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;