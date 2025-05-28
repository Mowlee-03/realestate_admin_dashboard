import { useState } from "react";
import { ADD_CATEGORY } from "./auth/api";
import axios from "axios";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

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

export default CategoryModal