
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import userService from '../../services/userService';

const AddUserDialog = ({ open, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    roleName: 'ROLE_CUSTOMER',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const roles = [
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_READ_ONLY', label: 'Read Only' },
    { value: 'ROLE_CUSTOMER', label: 'Customer' },
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user makes changes
    if (error) setError(null);
  };
  
  const validateForm = () => {
    // Simple validation
    if (!formData.username || !formData.password || !formData.firstName || 
        !formData.lastName || !formData.email || !formData.roleName) {
      setError('All fields are required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password length validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await userService.createUser(formData);
      onUserAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user. Please try again.');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Find the label text for the selected role
  const getSelectedRoleLabel = () => {
    const selectedRole = roles.find(role => role.value === formData.roleName);
    return selectedRole ? selectedRole.label : '';
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              helperText="Password must be at least 6 characters long"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel id="role-select-label" sx={{ 
                overflow: 'visible', 
                whiteSpace: 'nowrap',
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                }
              }}>
                Role
              </InputLabel>
              <Select
                labelId="role-select-label"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                label="Role"
                renderValue={(value) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {getSelectedRoleLabel()}
                  </Box>
                )}
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;