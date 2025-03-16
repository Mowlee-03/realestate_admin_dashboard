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
  DialogActions
} from '@mui/material';
import { Upload, X, Plus } from 'lucide-react';
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

// Category Modal Component
const CategoryModal = ({ open, onClose, onError,onSuccess, userId }) => {
  const [categoryData, setCategoryData] = useState({
    name: '',
    discription: '',
    image: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('images', file);

    try {
      const response = await axios.post(UPLOAD_FILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      // Get the first image path from the response
      const imagePath = response.data.imageUrls[0];
      setCategoryData(prev => ({ ...prev, image: imagePath }));
      setPreviewImage(imagePath);
      
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(ADD_CATEGORY(userId), categoryData);
      onSuccess();
      onClose();
      // Reset form
      setCategoryData({ name: '', discription: '', image: '' });
      setPreviewImage(null);
    } catch (error) {
      onError(error.response.data.message)
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setCategoryData({ name: '', discription: '', image: '' });
    setPreviewImage(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Category</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={categoryData.name}
            onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value.toLowerCase() })}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            value={categoryData.discription}
            onChange={(e) => setCategoryData({ ...categoryData, discription: e.target.value })}
          />
          
          {/* Image Upload Section */}
          <Box
            sx={{
              border: '2px dashed grey',
              borderRadius: '4px',
              p: 2,
              mt: 2,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Click to upload category image
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Box>

          {/* Loading Animation */}
          {isUploading && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 2,
              mt: 2 
            }}>
              <CircularProgress size={24} variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="textSecondary">
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}

          {/* Image Preview */}
          {previewImage && (
            <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
              <img
                src={previewImage}
                alt="Category preview"
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '4px' }}
              />
              <IconButton
                sx={{ 
                  position: 'absolute', 
                  top: -8, 
                  right: -8, 
                  backgroundColor: 'white',
                  ":hover": {
                    backgroundColor: 'black',
                    color: 'white',
                  }
                }}
                onClick={() => {
                  setCategoryData(prev => ({ ...prev, image: '' }));
                  setPreviewImage(null);
                }}
              >
                <X />
              </IconButton>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!categoryData.name || !categoryData.image}
        >
          Add Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// District Modal Component 
const DistrictModal = ({ open, onClose, onSuccess,onError, userId }) => {
  const [districtName, setDistrictName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(ADD_DISTRICT(userId), { name: districtName.toLowerCase() });
      onSuccess();
      onClose();
      setDistrictName('');
    } catch (error) {
      onError(error.response.data.message)
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New District</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="District Name"
          margin="normal"
          value={districtName}
          onChange={(e) => setDistrictName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!districtName}
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
  const [images, setImages] = useState([]);
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
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch categories and districts
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
    let tempErrors = {};
    if (!formData.title) tempErrors.title = 'Title is required';
    if (!formData.price) tempErrors.price = 'Price is required';
    if (!formData.location) tempErrors.location = 'Location is required';
    if (!formData.description) tempErrors.description = 'Description is required';
    if (formData.bedroom === '' || formData.bedroom < 0) tempErrors.bedroom = 'Number of bedrooms is required';
    if (formData.bathroom === '' || formData.bathroom < 0) tempErrors.bathroom = 'Number of bathrooms is required';
    if (!formData.category) tempErrors.category = 'Category is required';
    if (!formData.district) tempErrors.district = 'District is required';
    if (!formData.area) tempErrors.area = 'Area is required'; 
    if (images.length === 0) tempErrors.images = 'At least one image is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleImageChange = async (event) => {
    const files = event.target.files;
    if (!files.length) return;
    setIsUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    
    try {
      const response = await axios.post(UPLOAD_FILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      console.log(response);
      
      setImages((prevImages) => [...prevImages, ...response.data.imageUrls]);
    } catch (error) {
      console.log(error);
      
      setSnackbarMessage('Error uploading images. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageDelete = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleGridClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await axios.post(POST_PROPERTY(user.id), { ...formData, images });
        setSnackbarMessage('Property posted successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setFormData({
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
        setImages([]);
      } catch (error) {
        console.log(error);
        
        setSnackbarMessage(error.response.data.message);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    }
  };

  return (
    <Box p={3}>
      <h1>Post New Property</h1>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>           
              <Grid item xs={12} md={6}>
              <TextField
                label="Title"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title}
              />
              </Grid>
              <Grid item xs={12} md={6}>
              <TextField
              label="Price"
              type="number"
              fullWidth
              value={formData.price === 0 ? '' : formData.price}
              onChange={(e) => {
                const newValue = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                setFormData({ ...formData, price: newValue });
              }}
              error={!!errors.price}
              helperText={errors.price}
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
              />
              </Grid>

              <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Category"
                  select
                  fullWidth
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  error={!!errors.category}
                  helperText={errors.category}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.name} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
                <IconButton 
                  onClick={() => setCategoryModalOpen(true)}
                  sx={{ 
                    height: 56,
                    width: 56,
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.23)'
                  }}
                >
                  <Plus />
                </IconButton>
              </Box>
            </Grid>

            {/* Modified District field with Add button */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="District"
                  select
                  fullWidth
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  error={!!errors.district}
                  helperText={errors.district}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.name} value={district.name}>
                      {district.name}
                    </MenuItem>
                  ))}
                </TextField>
                <IconButton 
                  onClick={() => setDistrictModalOpen(true)}
                  sx={{ 
                    height: 56,
                    width: 56,
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.23)'
                  }}
                >
                  <Plus />
                </IconButton>
              </Box>
            </Grid>

              <Grid item xs={12} md={6}>
              <TextField
              label="Area (sq feet)"
              fullWidth
              value={formData.area}
              onChange={(e) => {
                // Only allow numbers and empty input
                const value = e.target.value;
                if (/^\d*$/.test(value)) {  // Allow only digits
                  setFormData({ ...formData, area: value }); // Store as string
                }
              }}
              error={!!errors.area}
              helperText={errors.area}
              />
              </Grid>
              <Grid item xs={12} md={6}>
              <TextField
                label="Type"
                select
                fullWidth
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="sale">For Sale</MenuItem>
                <MenuItem value="rent">For Rent</MenuItem>
              </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
              <TextField
              label="Bedrooms"
              type="number"
              fullWidth
              value={formData.bedroom !== '' ? formData.bedroom : 0}  // Default to 0 if empty
              onChange={(e) => {
                const newValue = e.target.value === '' ? 0 : Math.max(0, e.target.value);
                setFormData({ ...formData, bedroom: newValue });
              }}
              error={!!errors.bedroom}
              helperText={errors.bedroom}
              />
              </Grid>
              <Grid item xs={12} md={6}>
              <TextField
              label="Bathrooms"
              type="number"
              fullWidth
              value={formData.bathroom !== '' ? formData.bathroom : 0}  // Default to 0 if empty
              onChange={(e) => {
                const newValue = e.target.value === '' ? 0 : Math.max(0, e.target.value);
                setFormData({ ...formData, bathroom: newValue });
              }}
              error={!!errors.bathroom}
              helperText={errors.bathroom}
              />
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
                helperText={errors.description}
              />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Images</Typography>
                <Box
                  sx={{
                    border: '2px dashed grey',
                    borderRadius: '4px',
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={handleGridClick}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Click to select files or drag and drop
                  </Typography>
                  <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                    PNG, JPG, GIF up to 10MB each
                  </Typography>
                </Box>

                {/* Display image error */}
                {errors.images && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {errors.images}
                  </Typography>
                )}

                {/* Loading Animation */}
                {isUploading && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 2,
                    mt: 2 
                  }}>
                    <CircularProgress size={24} variant="determinate" value={uploadProgress} />
                    <Typography variant="body2" color="textSecondary">
                      Uploading... {Math.round(uploadProgress)}%
                    </Typography>
                  </Box>
                )}

                {images.length > 0 && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    {images.length} file(s) selected
                  </Typography>
                )}
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap' }}>
                  {images.map((image, index) => (
                    <Box key={index} sx={{ position: 'relative', margin: 1 }}>
                      <img
                        src={image}
                        alt="preview"
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <IconButton
                        sx={{ 
                          position: 'absolute', 
                          top: -8, 
                          right: -8, 
                          backgroundColor: 'white',
                          ":hover": {
                            backgroundColor: 'black',
                            color: 'white',
                          },
                        }}
                        onClick={() => handleImageDelete(index)}
                      >
                        <X />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleImageChange}
                />
              </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
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
          setSnackbarMessage('Category added successfully!');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
        }}
      onError={(message)=>{
        setSnackbarMessage(message)
        setSnackbarSeverity("error")
        setOpenSnackbar(true)
      }}

        userId={user.id}
      />

      <DistrictModal
        open={districtModalOpen}
        onClose={() => setDistrictModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setSnackbarMessage('District added successfully!');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
        }}
        onError={(message)=>{
          setSnackbarMessage(message)
          setSnackbarSeverity("error")
          setOpenSnackbar(true)
        }}
        userId={user.id}
      />


      <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'right'}} open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} >
        <Alert
        variant="filled"
        onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PostProperty;



