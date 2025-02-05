import React, { useContext, useState } from 'react'
import Sidebar from '../Components/Sidebar';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {user} =useContext(UserContext) 
  

 
  return (
    <>
    <BrowserRouter>
    <div className="min-h-screen bg-gray-100">
        {user && (
          <>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            {/* Overlay for mobile */}
            <div
              className={`fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden ${
                isSidebarOpen ? 'opacity-100 z-30' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            />
          </>
        )}
        
        <main className={`transition-all duration-300 ${user ? 'lg:ml-64' : ''}`}>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login/>} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/posts" element={
              <ProtectedRoute>
                <PostProperty />
              </ProtectedRoute>
            } />
            
            <Route path="/properties" element={
              <ProtectedRoute>
                <PropertyList />
              </ProtectedRoute>
            } />
            
            <Route path="/properties/:id" element={
              <ProtectedRoute>
                <ViewPost />
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    </>
  )
}

export default AppRouting