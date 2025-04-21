import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Search, Filter, XCircle, Tag, AlertCircle } from 'lucide-react'; 
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { VIEW_ALL_PROPERTY, GET_CATEGORIES } from './auth/api';

const PropertyList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: 'all',
    bedrooms: 'all',
    category: 'all',
    soldStatus: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define price ranges
  const priceRanges = [
    { min: 0, max: 500000, label: 'Under ₹5,00,000', value: 'under-500k' },
    { min: 500000, max: 1000000, label: '₹5,00,000 - ₹10,00,000', value: '500k-1m' },
    { min: 1000000, max: 2000000, label: '₹10,00,000 - ₹20,00,000', value: '1m-2m' },
    { min: 2000000, max: 3000000, label: '₹20,00,000 - ₹30,00,000', value: '2m-3m' },
    { min: 4000000, max: 5000000, label: '₹40,00,000-50,00,000', value: '4m-5m' },
    { min: 5000000, max: null, label: 'Over ₹50,00,000', value: 'over-5m' }
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(VIEW_ALL_PROPERTY);
        setProperties(response.data.data);
      } catch (error) {
        setError('Failed to fetch properties. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    const getCategories = async () => {
      try {
        let Category = await axios.get(GET_CATEGORIES);
        let dataofcategory = Category.data.data;
        const categoryNames = dataofcategory.map((data) => data.name);
        setCategories(categoryNames);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProperties();
    getCategories();
  }, []);
  
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'all' || property.type === filters.type;
    const matchesBedrooms = filters.bedrooms === 'all' || property.bedroom === parseInt(filters.bedrooms);
    const matchesCategory = filters.category === 'all' || property.category_name === filters.category;
    const matchesSoldStatus = filters.soldStatus === 'all' || 
                              (filters.soldStatus === 'sold' && property.isSold) || 
                              (filters.soldStatus === 'available' && !property.isSold);
    const matchesPriceRange = filters.priceRange === 'all' || (() => {
      const price = property.price;
      if (filters.priceRange === 'all') return true;
      
      const selectedRange = priceRanges.find(range => range.value === filters.priceRange);
      if (!selectedRange) return true;
      
      if (selectedRange.max === null) {
        return price >= selectedRange.min;
      } else {
        return price >= selectedRange.min && price < selectedRange.max;
      }
    })();

    return matchesSearch && matchesType && matchesBedrooms && matchesCategory && matchesPriceRange && matchesSoldStatus;
  });

  // Function to reset filters
  const clearFilters = () => {
    setFilters({
      type: 'all',
      priceRange: 'all',
      bedrooms: 'all',
      category: 'all',
      soldStatus: 'all'
    });
  };

  const formatPrice = (price, type) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac${type === 'rent' ? '/month' : ''}`;
    } else {
      return `₹${price.toLocaleString()}${type === 'rent' ? '/month' : ''}`;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-3">
          <div className="bg-white shadow-sm rounded-md px-4 py-2 border-l-4 border-blue-500 min-w-32">
            <p className="text-xs text-gray-500">Total Properties</p>
            <p className="text-lg font-bold">{properties.length}</p>
          </div>
          <div className="bg-white shadow-sm rounded-md px-4 py-2 border-l-4 border-green-500 min-w-32">
            <p className="text-xs text-gray-500">For Sale</p>
            <p className="text-lg font-bold">{properties.filter(p => p.type === 'sale').length}</p>
          </div>
          <div className="bg-white shadow-sm rounded-md px-4 py-2 border-l-4 border-purple-500 min-w-32">
            <p className="text-xs text-gray-500">For Rent</p>
            <p className="text-lg font-bold">{properties.filter(p => p.type === 'rent').length}</p>
          </div>
          <div className="bg-white shadow-sm rounded-md px-4 py-2 border-l-4 border-yellow-500 min-w-32">
            <p className="text-xs text-gray-500">Available</p>
            <p className="text-lg font-bold">{properties.filter(p => !p.isSold).length}</p>
          </div>
          <div className="bg-white shadow-sm rounded-md px-4 py-2 border-l-4 border-red-500 min-w-32">
            <p className="text-xs text-gray-500">Sold</p>
            <p className="text-lg font-bold">{properties.filter(p => p.isSold).length}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 sm:w-auto w-full"
            >
              <Filter size={18} />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            <button
              onClick={() => navigate('/posts')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm text-sm"
            >
              Add New Property
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 bg-gray-50 p-3 rounded-md">
              <select
                className="p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>

              <select
                className="p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              >
                <option value="all">All Prices</option>
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              <select
                className="p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              >
                <option value="all">All Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>

              <select
                className="p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.soldStatus}
                onChange={(e) => setFilters({ ...filters, soldStatus: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>

              <div className="col-span-2 sm:col-span-3 md:col-span-5 flex justify-end mt-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm"
                >
                  <XCircle size={16} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Listings */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <CircularProgress size={40} />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-center">
            <AlertCircle className="inline-block mr-2" size={20} />
            <span>{error}</span>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md text-center">
            <p className="font-medium">No properties match your filters</p>
            <button 
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 text-sm"
              onClick={clearFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag size={16} />
                <span>{filteredProperties.length} properties found</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-md shadow-sm overflow-hidden cursor-pointer border hover:shadow-md transition"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  <div className="relative h-40">
                    <img
                      src={property.image[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        property.type === 'sale' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {property.type === 'sale' ? 'Sale' : 'Rent'}
                      </span>
                      {property.isSold && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white">
                          SOLD
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3">
                    <h2 className="text-sm font-semibold mb-1 truncate">{property.title}</h2>
                    
                    <div className="flex items-center text-gray-500 mb-2">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <p className="text-xs truncate">{property.location}, {property.district_name}</p>
                    </div>

                    <p className="text-base font-bold text-blue-600 mb-2">
                      {formatPrice(property.price, property.type)}
                    </p>

                    <div className="grid grid-cols-3 gap-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Bed size={14} className="mr-1" />
                        <span>{property.bedroom}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath size={14} className="mr-1" />
                        <span>{property.bathroom}</span>
                      </div>
                      <div className="flex items-center">
                        <Square size={14} className="mr-1" />
                        <span>{property.area} sqft</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyList;