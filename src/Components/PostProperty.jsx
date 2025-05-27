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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip
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

// Enhanced Category Modal
const CategoryModal = ({ open, onClose, onError, onSuccess, userId }) => {
  const [categoryData, setCategoryData] = useState({ name: '', description: '', image: '' });
  // const [isUploading, setIsUploading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState(0);
  // const [previewImage, setPreviewImage] = useState(null);
  // const fileInputRef = useRef(null);

  // const handleImageUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   setIsUploading(true);
  //   const formData = new FormData();
  //   formData.append('images', file);

  //   try {
  //     const response = await axios.post(UPLOAD_FILE, formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //       onUploadProgress: (progressEvent) => {
  //         setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
  //       }
  //     });
      
  //     const imagePath = response.data.imageUrls[0];
  //     setCategoryData(prev => ({ ...prev, image: imagePath }));
  //     setPreviewImage(imagePath);
  //   } catch (error) {
  //     onError('Failed to upload image');
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(ADD_CATEGORY(userId), categoryData);
      onSuccess();
      onClose();
    } catch (error) {
      onError(error.response?.data?.message || 'Failed to add category');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        Add New Category
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Category Name"
          margin="normal"
          value={categoryData.name}
          onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value.toLowerCase() })}
          required
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Description"
          margin="normal"
          multiline
          rows={2}
          value={categoryData.description}
          onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
          variant="outlined"
        />
        
        {/* <Box
          sx={{
            border: '2px dashed',
            borderColor: 'grey.400',
            borderRadius: 1,
            p: 3,
            mt: 2,
            bgcolor: 'grey.50',
            '&:hover': { bgcolor: 'grey.100' },
            transition: 'all 0.2s'
          }}
          onClick={() => fileInputRef.current.click()}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Upload size={32} color="#666" />
            <Typography variant="body1" sx={{ mt: 1 }}>
              Upload Category Image
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports JPG, PNG (Max 10MB)
            </Typography>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Box>

        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <CircularProgress 
              variant="determinate" 
              value={uploadProgress} 
              size={24} 
              sx={{ mr: 1 }}
            />
            {uploadProgress}% Uploading...
          </Box>
        )}

        {previewImage && (
          <Box sx={{ mt: 2, position: 'relative', display: 'inline-flex' }}>
            <img src={previewImage} alt="Preview" style={{ maxWidth: 120, borderRadius: 4 }} />
            <IconButton
              size="small"
              sx={{ position: 'absolute', top: 0, right: 0 }}
              onClick={() => {
                setCategoryData(prev => ({ ...prev, image: '' }));
                setPreviewImage(null);
              }}
            >
              <X />
            </IconButton>
          </Box>
        )} */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!categoryData.name}
        >
          Add Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Enhanced District Modal
const DistrictModal = ({ open, onClose, onSuccess, onError, userId }) => {
  const [districtName, setDistrictName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(ADD_DISTRICT(userId), { name: districtName.toLowerCase() });
      onSuccess();
      setDistrictName('');
      onClose();
    } catch (error) {
      onError(error.response?.data?.message || 'Failed to add district');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        Add New District
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="District Name"
          margin="normal"
          value={districtName}
          onChange={(e) => setDistrictName(e.target.value)}
          required
          variant="outlined"
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!districtName.trim()}
        >
          Add District
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
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
                InputProps={{ inputProps: { min: 0 } }}
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
              >
                <MenuItem value="sale">For Sale</MenuItem>
                <MenuItem value="rent">For Rent</MenuItem>
              </TextField>
            </Grid>

            {/* Property Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Property Details</Typography>
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
                    sx={{ alignSelf: 'center' }}
                    color="primary"
                  >
                    <Plus />
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
                    sx={{ alignSelf: 'center' }}
                    color="primary"
                  >
                    <Plus />
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
              />
            </Grid>

            {/* Images Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Property Images</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'grey.400',
                  borderRadius: 1,
                  p: 4,
                  bgcolor: 'grey.50',
                  '&:hover': { bgcolor: 'grey.100' },
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current.click()}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Upload size={48} color="#666" />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Drop images here or click to upload
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports JPG, PNG, GIF (Max 10MB each) *Required
                  </Typography>
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Box>

              {errors.images && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.images}
                </Typography>
              )}

              {isUploading && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    size={24} 
                  />
                  <Typography>Uploading: {uploadProgress}%</Typography>
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {imagePreviews.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img
                      src={image}
                      alt={`Preview ${index}`}
                      style={{ 
                        width: 100, 
                        height: 100, 
                        objectFit: 'cover', 
                        borderRadius: 4 
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0,
                        bgcolor: 'white',
                        '&:hover': { bgcolor: 'grey.200' }
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isUploading}
                sx={{ py: 1.5, mt: 2 }}
              >
                Post Property
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PostProperty;