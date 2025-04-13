import React, { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, User } from 'lucide-react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { USERS_DATA } from './auth/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const columns = [
    {
      field: 'username',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {params.row.image ? (
              <img src={params.row.image} alt={params.row.username} className="h-10 w-10 object-cover" />
            ) : (
              <User size={24} />
            )}
          </div>
          <span className="ml-2">{params.row.username}</span>
        </div>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div className="flex items-center text-sm text-gray-700">
          <Mail size={16} className="mr-2" />
          {params.row.email}
        </div>
      )
    },
    {
      field: 'phone_number',
      headerName: 'Phone',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center text-sm text-gray-700">
          <Phone size={16} className="mr-2" />
          {params.row.phone_number}
        </div>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <div className="flex items-center text-sm text-gray-700">
          <Calendar size={16} className="mr-2" />
          {new Date(params.row.createdAt).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 max-sm:flex-col max-sm:gap-3">
       
        {error && (
          <Button variant="contained" color="primary" onClick={handleRefresh}>
            Refresh
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <CircularProgress />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '70vh',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f1f5f9', // Tailwind slate-100
              fontWeight: 'bold',
              fontSize: 14,
            },
            '& .MuiDataGrid-cell': {
              alignItems: 'center',
            },
            '& .MuiDataGrid-root': {
              borderRadius: '12px',
            }
          }}
        >
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row.id}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            sx={{ backgroundColor: '#ffffff' }}
          />
        </Box>
      )}
    </div>
  );
};

export default Users;
