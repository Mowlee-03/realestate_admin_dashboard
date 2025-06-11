import React, { useContext } from 'react';
import Sidebar from '../Components/Sidebar';
import MainNavbar from '../Components/Mainnavbar';
import Dashboard from '../Components/Dashboard';
import PostProperty from '../Components/PostProperty';
import ViewPost from '../Components/ViewPost';
import Users from '../Components/Users';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PropertyList from '../Components/PropertyList';
import ProtectedRoute from './ProtectedRoute';
import Login from '../Components/auth/Login';
import { UserContext } from '../Provider/Userprovider';
const AppRouting = () => {
  const { user, loading } = useContext(UserContext);

  // 🛑 Wait for loading to finish
  if (loading) return null; // or a spinner

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {user && <Sidebar />}
        <main className={`transition-all duration-300 ${user ? 'lg:ml-64  pb-16 lg:pb-0' : ''}`}>
          {user && <MainNavbar />}
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/posts" element={<ProtectedRoute><PostProperty /></ProtectedRoute>} />
            <Route path="/properties" element={<ProtectedRoute><PropertyList /></ProtectedRoute>} />
            <Route path="/properties/:id" element={<ProtectedRoute><ViewPost /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default AppRouting;