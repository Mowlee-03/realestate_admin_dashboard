import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Share2, Heart, Upload, Trash2, Clock, Home, Tag, Info, Check,DeleteIcon } from 'lucide-react';
import axios from 'axios';
import { CREATE_COMMISSION, DELETE_COMMISSION, DELETE_IMAGES, DELETE_PROPERTY, GET_COMMISSION_BY_ID, PROPERTY, UPDATE_COMMISSION_BY_ID, UPDATE_PROPERTY, UPLOAD_FILE } from './auth/api';
import { DeleteOutline } from '@mui/icons-material';
import { DeleteConfirmationModal, ErrorMessage, ImageDialog, ImageEditor, ImageGallery, LoadingSpinner } from './utilities';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commission, setCommission] = useState(null);
  const [commissionAmount, setCommissionAmount] = useState('');
  const [commissionNotes, setCommissionNotes] = useState('');

useEffect(() => {
    const fetchPropertyAndCommission = async () => {
      try {
        // Fetch property data
        const propertyResponse = await axios.get(PROPERTY(id));
        setProperty(propertyResponse.data.data);
        setEditedProperty(propertyResponse.data.data);
        
        // Fetch commission data if property is sold
        if (propertyResponse.data.data.isSold) {
          const commissionResponse = await axios.get(GET_COMMISSION_BY_ID(id));
          if (commissionResponse.data.data) {
            setCommission(commissionResponse.data.data);
            setCommissionAmount(commissionResponse.data.data.amount.toString());
            setCommissionNotes(commissionResponse.data.data.notes || '');
          }
        }
      } catch (error) {
        setError('Failed to load property data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyAndCommission();
  }, [id]);

  const handleCommissionSave = async () => {
    try {
      setLoading(true);
      
      if (commission) {
        // Update existing commission
        const response = await axios.put(UPDATE_COMMISSION_BY_ID(commission.id), {
          amount: parseInt(commissionAmount),
          notes: commissionNotes
        });
        setCommission(response.data.data);
      } else {
        // Create new commission
        const response = await axios.post(CREATE_COMMISSION, {
          postId: parseInt(id),
          amount: parseInt(commissionAmount),
          notes: commissionNotes
        });
        setCommission(response.data.data);
      }
      
    } catch (error) {
      console.error('Error saving commission:', error);
      setError('Failed to save commission data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommissionDelete = async () => {
    try {
      if (commission) {
        await axios.delete(DELETE_COMMISSION(commission.id));
        setCommission(null);
        setCommissionAmount('');
        setCommissionNotes('');
      }
    } catch (error) {
      console.error('Error deleting commission:', error);
      setError('Failed to delete commission data.');
    }
  };

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

  const handleToggleSold = async () => {
    const newSoldStatus = !editedProperty.isSold;
    setEditedProperty({ ...editedProperty, isSold: newSoldStatus });
    
    if (!newSoldStatus && commission) {
      // Property marked as unsold - delete commission if exists
      await handleCommissionDelete();
    }
  };


const handleSave = async () => {
    try {
      setLoading(true);
      setUploading(true);

      // Delete images from Firebase
      if (imagesToDelete.length > 0) {
        await axios.post(DELETE_IMAGES, { imageUrls: imagesToDelete });
      }

      // Upload pending images
      let updatedImages = [...(editedProperty.image || [])];
      if (pendingImages.length > 0) {
        const formData = new FormData();
        pendingImages.forEach((file) => formData.append('images', file));
        const response = await axios.post(UPLOAD_FILE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updatedImages.push(...response.data.imageUrls);
      }

      // Update property with new images
      const payload = {
        ...editedProperty,
        image: updatedImages,
        price: parseFloat(editedProperty.price) || 0,
        bedroom: parseInt(editedProperty.bedroom) || 0,
        bathroom: parseInt(editedProperty.bathroom) || 0,
        area: editedProperty.area || '',
      };

      await axios.put(UPDATE_PROPERTY(id), payload);
      
      // Handle commission if property is sold
      if (editedProperty.isSold && (commissionAmount || commissionNotes)) {
        await handleCommissionSave();
      } else if (!editedProperty.isSold && commission) {
        await handleCommissionDelete();
      }

      // Refresh data
      const response = await axios.get(PROPERTY(id));
      setProperty(response.data.data);
      setEditedProperty(response.data.data);
      
      if (response.data.data.isSold) {
        const commissionResponse = await axios.get(GET_COMMISSION_BY_ID(id));
        if (commissionResponse.data.data) {
          setCommission(commissionResponse.data.data);
          setCommissionAmount(commissionResponse.data.data.amount.toString());
          setCommissionNotes(commissionResponse.data.data.notes || '');
        }
      }
      
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
  const handledeleteproperty = () => {
    setShowDeleteModal(true);
  };
 const handleConfirmDelete = async () => {
  try {
    setLoading(true);
    
    // First delete images from Firebase if they exist
    if (property.image && property.image.length > 0) {
      await axios.post(DELETE_IMAGES, { imageUrls: property.image });
    }

    // Then delete the property record
    await axios.delete(DELETE_PROPERTY(id));

    // Redirect after successful deletion
    window.location.href = '/properties'; // or your preferred redirect path
  } catch (error) {
    console.error('Error deleting property:', error);
    setError('Failed to delete property. ' + (error.response?.data?.message || ''));
    setShowDeleteModal(false);
    setLoading(false);
  }
};
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
                <div>
                  <button
                    onClick={handledeleteproperty}
                    className="px-5 py-2 mr-3 bg-gradient-to-r from-red-600 to-red-400 text-white rounded-lg hover:opacity-90 transition-colors shadow-md"
                  >
                    <DeleteOutline/>
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-colors shadow-md"
                  >
                    Edit
                  </button>
                </div>
                  
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
        <div className="flex items-center mb-4">
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

        {/* Commission Section */}
        {(editMode ? editedProperty.isSold : property?.isSold) && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
            <h3 className="text-xl font-bold mb-3 text-gray-800 flex items-center">
              {/* <DollarSign size={20} className="mr-2 text-indigo-500" /> */}
              Commission Details
            </h3>
            
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={commissionAmount}
                    onChange={(e) => setCommissionAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter commission amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={commissionNotes}
                    onChange={(e) => setCommissionNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter any notes about the commission (e.g., payment status, buyer info)"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium mr-2">Amount:</span>
                  <span className="text-indigo-600">₹{commission?.amount?.toLocaleString() || 'Not specified'}</span>
                </div>
                {commission?.notes && (
                  <div>
                    <span className="text-gray-700 font-medium mr-2">Notes:</span>
                    <span className="text-gray-600">{commission.notes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
      {showDeleteModal && (
  <DeleteConfirmationModal
    onConfirm={handleConfirmDelete}
    onCancel={() => setShowDeleteModal(false)}
    propertyTitle={property.title}
  />
)}
    </div>
  );
};

export default ViewPost;