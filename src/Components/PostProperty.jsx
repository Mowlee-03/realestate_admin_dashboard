import React, { useContext, useRef, useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  Box,
  Paper,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Tooltip,
  Chip
} from '@mui/material';
import { Upload, X, Plus, Info } from 'lucide-react';
import axios from 'axios';
import { 
  POST_PROPERTY, 
  UPLOAD_FILE, 
  GET_DISTRICTS, 
  GET_CATEGORIES,
  ADD_CATEGORY,
  ADD_DISTRICT 
} from './auth/api';
import { UserContext } from '../Provider/Userprovider';
import DistrictModal from './DistrictModal';
import CategoryModal from './CategoryModal';

const PostProperty = () => {
  const { user } = useContext(UserContext);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
    type: 'sale',
    bedroom: '',
    bathroom: '',
    area: '',
    category: '',
    district: '',
  });
  
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    try {
      const [categoriesRes, districtsRes] = await Promise.all([
        axios.get(GET_CATEGORIES),
        axios.get(GET_DISTRICTS)
      ]);
      setCategories(categoriesRes.data.data);
      setDistricts(districtsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validate = () => {
    const tempErrors = {};
    const requiredFields = {
      title: 'Title is required',
      price: 'Price is required',
      location: 'Location is required',
      description: 'Description is required',
      category: 'Category is required',
      district: 'District is required',
      area: 'Area is required',
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field]) tempErrors[field] = message;
    });

    if (!selectedFiles.length) tempErrors.images = 'At least one image is required';
    if (formData.bedroom === '' || formData.bedroom < 0) tempErrors.bedroom = 'Valid number required';
    if (formData.bathroom === '' || formData.bathroom < 0) tempErrors.bathroom = 'Valid number required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      handleImageChange({ target: { files } });
    }
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setSelectedFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (!selectedFiles.length) return [];

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('images', file));

    try {
      const response = await axios.post(UPLOAD_FILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });
      return response.data.imageUrls;
    } catch (error) {
      throw new Error('Image upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const imageUrls = await uploadImages();
      await axios.post(POST_PROPERTY(user.id), { ...formData, images: imageUrls });
      setSnackbar({ open: true, message: 'Property posted successfully!', severity: 'success' });
      setFormData({
        title: '', price: '', location: '', description: '', type: 'sale',
        bedroom: '', bathroom: '', area: '', category: '', district: ''
      });
      setSelectedFiles([]);
      setImagePreviews([]);
      setErrors({});
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.message || error.response?.data?.message || 'Failed to post property', 
        severity: 'error' 
      });
    }
  };

  // Cleanup preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={0} sx={{ 
        p: 4, 
        borderRadius: 4,
        background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Chip label="1" size="small" color="primary" sx={{ fontWeight: 600 }} />
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Property Title"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Price ($)"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Math.max(0, e.target.value) || '' })}
                error={!!errors.price}
                helperText={errors.price}
                variant="outlined"
                required
                InputProps={{ 
                  inputProps: { min: 0 },
                  startAdornment: (
                    <Typography color="text.secondary" sx={{ mr: 1 }}>$</Typography>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Location"
                fullWidth
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                error={!!errors.location}
                helperText={errors.location}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Property Type"
                fullWidth
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="sale">For Sale</MenuItem>
                <MenuItem value="rent">For Rent</MenuItem>
              </TextField>
            </Grid>

            {/* Property Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Chip label="2" size="small" color="primary" sx={{ fontWeight: 600 }} />
                Property Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Bedrooms"
                type="number"
                fullWidth
                value={formData.bedroom}
                onChange={(e) => setFormData({ ...formData, bedroom: Math.max(0, e.target.value) || '' })}
                error={!!errors.bedroom}
                helperText={errors.bedroom}
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Bathrooms"
                type="number"
                fullWidth
                value={formData.bathroom}
                onChange={(e) => setFormData({ ...formData, bathroom: Math.max(0, e.target.value) || '' })}
                error={!!errors.bathroom}
                helperText={errors.bathroom}
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Area (sq ft)"
                type="text"
                fullWidth
                value={formData.area}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (/^\d*\.?\d*$/.test(value) && Number(value) >= 0)) {
                    setFormData({ ...formData, area: value });
                  }
                }}
                error={!!errors.area}
                helperText={errors.area}
                variant="outlined"
                required
                InputProps={{ inputProps: { min: 0 } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  error={!!errors.category}
                  helperText={errors.category}
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.name} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Tooltip title="Add new category">
                  <IconButton
                    onClick={() => setCategoryModalOpen(true)}
                    sx={{ 
                      alignSelf: 'center',
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      }
                    }}
                  >
                    <Plus size={20} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  select
                  label="District"
                  fullWidth
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  error={!!errors.district}
                  helperText={errors.district}
                  variant="outlined"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.name} value={district.name}>
                      {district.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Tooltip title="Add new district">
                  <IconButton
                    onClick={() => setDistrictModalOpen(true)}
                    sx={{ 
                      alignSelf: 'center',
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      }
                    }}
                  >
                    <Plus size={20} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={4}
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={!!errors.description}
                helperText={errors.description || 'Describe your property in detail'}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* Images Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Chip label="3" size="small" color="primary" sx={{ fontWeight: 600 }} />
                Property Images
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  bgcolor: isDragging ? 'rgba(25, 118, 210, 0.04)' : 'grey.50',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onClick={() => fileInputRef.current.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  bgcolor: isDragging ? 'primary.light' : 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  transition: 'all 0.3s ease'
                }}>
                  <Upload size={24} color={isDragging ? 'primary.main' : '#666'} />
                </Box>
                <Typography variant="body1" sx={{ 
                  mb: 1,
                  color: isDragging ? 'primary.main' : 'text.primary'
                }}>
                  {isDragging ? 'Drop images here' : 'Drag & drop images or click to browse'}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: isDragging ? 'primary.main' : 'text.secondary'
                }}>
                  Supports JPG, PNG, GIF (Max 10MB each)
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'error.main',
                  mt: 1,
                  fontWeight: 500,
                  visibility: errors.images ? 'visible' : 'hidden'
                }}>
                  {errors.images || 'Required'}
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Box>

              {isUploading && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    size={24} 
                    thickness={4}
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography variant="body2">Uploading: {uploadProgress}%</Typography>
                </Box>
              )}

              {imagePreviews.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    Selected Images ({imagePreviews.length})
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 2,
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'grey.50'
                  }}>
                    {imagePreviews.map((image, index) => (
                      <Box key={index} sx={{ 
                        position: 'relative',
                        width: 100,
                        height: 100,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        boxShadow: 1
                      }}>
                        <img
                          src={image}
                          alt={`Preview ${index}`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: 4, 
                            right: 4,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                        >
                          <X size={16} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isUploading}
                sx={{ 
                  py: 1.5, 
                  mt: 2,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                  }
                }}
              >
                {isUploading ? (
                  <>
                    <CircularProgress size={24} sx={{ color: 'white', mr: 2 }} />
                    Posting Property...
                  </>
                ) : 'Post Property'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Modals */}
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setSnackbar({ open: true, message: 'Category added successfully!', severity: 'success' });
        }}
        onError={(message) => setSnackbar({ open: true, message, severity: 'error' })}
        userId={user.id}
      />

      <DistrictModal
        open={districtModalOpen}
        onClose={() => setDistrictModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setSnackbar({ open: true, message: 'District added successfully!', severity: 'success' });
        }}
        onError={(message) => setSnackbar({ open: true, message, severity: 'error' })}
        userId={user.id}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 2,
            fontWeight: 500
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PostProperty;