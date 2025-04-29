import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Share2, Heart, Upload, Trash2, Clock, Home, Tag, Info, Check } from 'lucide-react';
import axios from 'axios';
import { DELETE_IMAGES, PROPERTY, UPDATE_PROPERTY, UPLOAD_FILE } from './auth/api';

const ViewPost = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProperty, setEditedProperty] = useState({});
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [pendingImages, setPendingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(PROPERTY(id));
        setProperty(response.data.data);
        setEditedProperty(response.data.data);
      } catch (error) {
        setError('Failed to load property data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setEditedProperty({ ...property });
      setPendingImages([]);
      setImagesToDelete([]);
    } else {
      setPendingImages([]);
      setImagesToDelete([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProperty({ ...editedProperty, [name]: value });
  };

  const handleToggleSold = () => {
    setEditedProperty({ ...editedProperty, isSold: !editedProperty.isSold });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setUploading(true);

      // Delete images from Firebase
      if (imagesToDelete.length > 0) {
        const data=await axios.post(DELETE_IMAGES, { imageUrls: imagesToDelete });
        console.log(data);
        
      }

      // Upload pending images
      let updatedImages = [...(editedProperty.image || [])];
      if (pendingImages.length > 0) {
        const formData = new FormData();
        pendingImages.forEach((file) => formData.append('images', file));
        const response = await axios.post(UPLOAD_FILE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updatedImages.push(...response.data.imageUrls); // Match backend response
      }

      // Update property with new images
      const payload = {
        ...editedProperty,
        image: updatedImages,
        price: parseFloat(editedProperty.price) || 0,
        bedroom: parseInt(editedProperty.bedroom) || 0,
        bathroom: parseInt(editedProperty.bathroom) || 0,
        area: editedProperty.area|| '',
      };

      await axios.put(UPDATE_PROPERTY(id), payload);
      setProperty(payload);
      setEditedProperty(payload);
      setPendingImages([]);
      setImagesToDelete([]);
      setEditMode(false);
    } catch (error) {
      console.error(error);
      setError('Failed to update property or manage images.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setOpenImageDialog(true);
    setActiveImageIndex(index);
  };

  const navigateImage = (direction) => {
    if (!property?.image?.length) return;
    let newIndex = activeImageIndex + direction;
    newIndex = (newIndex + property.image.length) % property.image.length;
    setActiveImageIndex(newIndex);
    setSelectedImage(property.image[newIndex]);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/properties/${id}`;
    const shareData = {
      title: property.title,
      text: property.description.substring(0, 100) + '...',
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert('Failed to share. Link copied to clipboard instead.');
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    setPendingImages([...pendingImages, ...Array.from(files)]);
    setImageUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = (indexToRemove) => {
    const imageToRemove = editedProperty.image[indexToRemove];
    setImagesToDelete([...imagesToDelete, imageToRemove]);
    const updatedImages = editedProperty.image.filter((_, index) => index !== indexToRemove);
    setEditedProperty({ ...editedProperty, image: updatedImages });
  };

  const handleDeletePendingImage = (indexToRemove) => {
    const updatedPendingImages = pendingImages.filter((_, index) => index !== indexToRemove);
    setPendingImages(updatedPendingImages);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const propertyType = property.type === 'rent' ? 'For Rent' : 'For Sale';
  const propertyTypeColor = property.type === 'rent' ? 'bg-purple-600' : 'bg-green-600';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1>{property.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative">
            {!editMode && (
              <div className={`absolute top-4 left-4 ${propertyTypeColor} text-white text-sm font-medium px-3 py-1 rounded-full z-10 shadow-md`}>
                {propertyType}
              </div>
            )}
            <div className="relative">
              {editMode ? (
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                  <ImageEditor
                    images={editedProperty.image}
                    pendingImages={pendingImages}
                    onDelete={handleDeleteImage}
                    onDeletePending={handleDeletePendingImage}
                    onUpload={handleImageUpload}
                    uploading={uploading}
                    error={imageUploadError}
                    fileInputRef={fileInputRef}
                  />
                </div>
              ) : (
                <ImageGallery
                  images={property.image}
                  onImageClick={handleImageClick}
                />
              )}
            </div>
          </div>

          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {editMode ? (
                    <input
                      type="text"
                      name="title"
                      value={editedProperty.title || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    property.title
                  )}
                </h1>
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-2 text-indigo-500" />
                  {editMode ? (
                    <input
                      type="text"
                      name="location"
                      value={editedProperty.location || ''}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-lg">{property.location}, {property.district_name}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {editMode ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-colors shadow-md relative"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-colors shadow-md"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl mb-6 flex flex-wrap items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editMode ? (
                    <div className="flex items-center">
                      <span className="text-indigo-500 mr-1">₹</span>
                      <input
                        type="number"
                        name="price"
                        min="0"
                        value={editedProperty.price || ''}
                        onChange={handleInputChange}
                        className="w-32 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <span className="text-indigo-600">₹{parseFloat(property.price).toLocaleString()}
                      {property.type === 'rent' && <span className="text-indigo-400 text-xl">/month</span>}
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap gap-6 mt-2 sm:mt-0">
                  <div className="flex items-center">
                    <div className="bg-white p-2 rounded-full shadow-sm mr-2">
                      <Bed size={18} className="text-indigo-500" />
                    </div>
                    {editMode ? (
                      <input
                        type="number"
                        name="bedroom"
                        min="0"
                        value={editedProperty.bedroom || ''}
                        onChange={handleInputChange}
                        className="w-16 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{property.bedroom} <span className="text-gray-600">Beds</span></span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className="bg-white p-2 rounded-full shadow-sm mr-2">
                      <Bath size={18} className="text-indigo-500" />
                    </div>
                    {editMode ? (
                      <input
                        type="number"
                        name="bathroom"
                        min="0"
                        value={editedProperty.bathroom || ''}
                        on sparsifyChange={handleInputChange}
                        className="w-16 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{property.bathroom} <span className="text-gray-600">Baths</span></span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className="bg-white p-2 rounded-full shadow-sm mr-2">
                      <Square size={18} className="text-indigo-500" />
                    </div>
                    {editMode ? (
                      <input
                        type="number"
                        name="area"
                        min="0"
                        value={editedProperty.area || ''}
                        onChange={handleInputChange}
                        className="w-20 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{property.area} <span className="text-gray-600">sqft</span></span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <Home size={20} className="mr-2 text-indigo-500" />
                  Property Status
                </h3>
                <div className="flex items-center">
                  <span className="text-gray-700 mr-3">Sold:</span>
                  {editMode ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedProperty.isSold || false}
                        onChange={handleToggleSold}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </label>
                  ) : (
                    <span className={`font-medium ${property.isSold ? 'text-red-600' : 'text-green-600'}`}>
                      {property.isSold ? 'Sold' : 'Available'}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <Info size={20} className="mr-2 text-indigo-500" />
                  About This Property
                </h3>
                {editMode ? (
                  <textarea
                    name="description"
                    value={editedProperty.description || ''}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-100">
                    {property.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {openImageDialog && (
        <ImageDialog
          image={selectedImage}
          index={activeImageIndex}
          total={property.image?.length || 0}
          onClose={() => setOpenImageDialog(false)}
          onNavigate={navigateImage}
        />
      )}
    </div>
  );
};

// Sub-components (unchanged from your original code)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center text-indigo-500 text-sm font-medium">Loading</div>
    </div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="bg-red-50 text-red-700 px-6 py-4 rounded-lg border border-red-200 max-w-md">
      <div className="font-bold text-lg mb-2">Error</div>
      <div>{message}</div>
    </div>
  </div>
);

const ImageGallery = ({ images, onImageClick }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-0">
    {images?.length > 0 && (
      <div className="md:col-span-2">
        <img
          src={images[0]}
          alt="Main view"
          className="w-full h-64 md:h-96 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md"
          onClick={() => onImageClick(images[0], 0)}
        />
      </div>
    )}
    <div className="grid grid-cols-2 gap-3">
      {images?.slice(1, 5).map((image, index) => (
        <div key={index} className="relative">
          <img
            src={image}
            alt={`View ${index + 2}`}
            className="w-full h-32 md:h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md"
            onClick={() => onImageClick(image, index + 1)}
          />
          {index === 3 && images.length > 5 && (
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 bg-opacity-70 flex items-center justify-center rounded-lg cursor-pointer"
              onClick={() => onImageClick(images[4], 4)}
            >
              <span className="text-white text-xl font-bold">+{images.length - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const ImageEditor = ({ images, pendingImages, onDelete, onDeletePending, onUpload, uploading, error, fileInputRef }) => (
  <div>
    <h3 className="text-xl font-bold mb-4 text-gray-800">Manage Images</h3>
    {error && <div className="text-red-500 mb-3 bg-red-50 p-2 rounded-lg">{error}</div>}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {images?.map((image, index) => (
        <div key={`existing-${index}`} className="relative group rounded-lg overflow-hidden shadow-md">
          <img src={image} alt={`View ${index + 1}`} className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
          <button
            onClick={() => onDelete(index)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {pendingImages?.map((file, index) => (
        <div key={`pending-${index}`} className="relative group rounded-lg overflow-hidden shadow-md">
          <img
            src={URL.createObjectURL(file)}
            alt={`Pending ${index + 1}`}
            className="w-full h-32 object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
          <button
            onClick={() => onDeletePending(index)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 size={14} />
          </button>
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            Pending
          </div>
        </div>
      ))}
      <div className="border-2 border-dashed border-indigo-200 rounded-lg flex items-center justify-center h-32 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
          multiple
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="flex flex-col items-center text-indigo-500"
          disabled={uploading}
        >
          <Upload size={24} />
          <span className="mt-2 text-sm font-medium">Add Image</span>
        </button>
      </div>
    </div>
  </div>
);

const ImageDialog = ({ image, index, total, onClose, onNavigate }) => (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
    <div className="relative max-w-5xl w-full">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 p-2 rounded-full"
      >
        <XIcon size={20} />
      </button>
      <div className="relative">
        <img src={image} alt="Preview" className="w-full h-auto max-h-[80vh] object-contain" />
        <button
          onClick={() => onNavigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => onNavigate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      <div className="text-white text-center mt-4 font-medium">
        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 rounded-full">
          {index + 1} / {total}
        </span>
      </div>
    </div>
  </div>
);

const ChevronLeft = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const XIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default ViewPost;