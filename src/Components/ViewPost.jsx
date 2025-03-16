import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // to access the id from the URL
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import axios from 'axios';
import { CircularProgress } from '@mui/material'; // MUI CircularProgress
import { PROPERTY, } from './auth/api'; // Adjust the import if necessary

const ViewPost = () => {
  const { id } = useParams();  // Extracting id from URL params
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
console.log(property);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(PROPERTY(id)); // Fetch property by id
        setProperty(response.data.data);
      } catch (error) {
        setError('Failed to load property data. Please try again later.');
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    ); // Display loading indicator when property data is being fetched
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 font-bold">{error}</p> {/* Show error message */}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <div className="relative h-96">
              <img
                src={property.image[0]}
                alt={property.title}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {property.image.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Property view ${index + 2}`}
                  className="h-24 w-full object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">{property.title}</h1>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              {property.price}
            </p>

            <div className="flex items-center text-gray-600 mb-4">
              <MapPin size={20} className="mr-2" />
              {property.location}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <Bed size={20} className="mr-2 text-gray-600" />
                <span>{property.bedrooms} Beds</span>
              </div>
              <div className="flex items-center">
                <Bath size={20} className="mr-2 text-gray-600" />
                <span>{property.bathrooms} Baths</span>
              </div>
              <div className="flex items-center">
                <Square size={20} className="mr-2 text-gray-600" />
                <span>{property.area} sqft</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{property.description}</p>
            </div>

            <div className="mt-6">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPost;
