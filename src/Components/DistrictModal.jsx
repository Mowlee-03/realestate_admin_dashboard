import { useState } from "react";
import { ADD_DISTRICT } from "./auth/api";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import axios from "axios";

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

export default DistrictModal