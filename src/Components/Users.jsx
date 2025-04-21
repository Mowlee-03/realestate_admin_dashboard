import React, { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, User, RefreshCw, Search } from 'lucide-react';
import { DataGrid } from '@mui/x-data-grid';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { USERS_DATA } from './auth/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUserData = async () => {
    try {
      const response = await axios.get(USERS_DATA);
      setUsers(response.data.data);
      setError('');
    } catch (error) {
      console.error(error);
      setError('Failed to fetch user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchUserData();
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    return (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    {
      field: 'username',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {params.row.image ? (
              <img src={params.row.image} alt={params.row.username} className="h-10 w-10 object-cover" />
            ) : (
              <User size={18} className="text-blue-600" />
            )}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{params.row.username}</div>
          </div>
        </div>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <div className="flex items-center text-sm text-gray-600">
          <Mail size={14} className="mr-2 text-gray-400" />
          {params.row.email}
        </div>
      ),
    },
    {
      field: 'phone_number',
      headerName: 'Phone',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center text-sm text-gray-600">
          <Phone size={14} className="mr-2 text-gray-400" />
          {params.row.phone_number}
        </div>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={14} className="mr-2 text-gray-400" />
          {new Date(params.row.createdAt).toLocaleString()}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">View and manage all system users</p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="text-red-700 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* DataGrid */}
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <CircularProgress size={40} className="text-blue-500" />
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            </div>
          ) : (
            <div style={{ height: '70vh', width: '100%' }}>
              <DataGrid
                rows={filteredUsers}
                columns={columns}
                getRowId={(row) => row.id}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f1f5f9',
                    fontWeight: 'bold',
                    fontSize: 14,
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f1f5f9',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8fafc',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid #f1f5f9',
                    backgroundColor: '#f9fafb',
                  },
                  '& .MuiTablePagination-root': {
                    color: '#64748b',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: '#ffffff',
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;