import React, { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, User } from 'lucide-react';
import { Modal, Box, Typography, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { USERS_DATA } from './auth/api';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState({ latitude: null, longitude: null });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

console.log(users)
  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(USERS_DATA);
      setUsers(response.data.data);
      setError('');  // Clear any previous error messages
    } catch (error) {
      console.log(error);
      
      setError('Failed to fetch user data. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchUserData(); // Initial data fetch
  }, []);

  const handleLocationClick = (latitude, longitude) => {
    setSelectedCoordinates({ latitude, longitude });
    setOpen(true); // Open the modal when location is clicked
  };

  const handleClose = () => {
    setOpen(false); // Close the modal
  };

  const handleRefresh = () => {
    setLoading(true); // Set loading state to true while refreshing
    fetchUserData();  // Fetch user data again
  };

  const userImage = (user) => {
    return user.image ? (
      <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full" />
    ) : (
      <User size={24} />
    );
  };

  const locationLink = selectedCoordinates.latitude && selectedCoordinates.longitude
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyCJIxs65no49mgT-ghvWADzXNq5JZyd6qA&q=${selectedCoordinates.latitude},${selectedCoordinates.longitude}`
    : '';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 max-lg:justify-around">
        <h1 className="text-2xl font-bold max-lg:text-center">Users</h1>
      </div>

      {loading && <CircularProgress />}
      {error && (
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button onClick={handleRefresh} variant="contained">
            Refresh
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Created <br /> Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {userImage(user)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail size={16} className="mr-2" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone size={16} className="mr-2" />
                        {user.phone_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-2" />
                      {new Date(user.createdAt).toLocaleString()}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default Users;
