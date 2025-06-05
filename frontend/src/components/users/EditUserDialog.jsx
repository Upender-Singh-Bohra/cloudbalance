

import { useState, useEffect } from "react";
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
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import userService from "../../services/userService";
import { useSelector } from "react-redux"; 

const EditUserDialog = ({ open, onClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    roleName: "",
  });

  const [originalRole, setOriginalRole] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current user from Redux store (might need to adjust based on my actual auth state management)
  const currentUser = useSelector((state) => state.auth.user);

  const roles = [
    { value: "ROLE_ADMIN", label: "Admin" },
    { value: "ROLE_READ_ONLY", label: "Read Only" },
    { value: "ROLE_CUSTOMER", label: "Customer" },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        password: "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        roleName: user.roleName || "",
      });
      setOriginalRole(user.roleName || "");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user makes changes
    if (error) setError(null);
  };

  const handlePasswordToggle = () => {
    setChangePassword(!changePassword);
    if (!changePassword) {
      setFormData({
        ...formData,
        password: "",
      });
    }
  };

  const validateForm = () => {
    // Simple validation
    if (
      !formData.username ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.roleName
    ) {
      setError("Required fields cannot be empty");
      return false;
    }

    // Password validation if changing
    if (
      changePassword &&
      (!formData.password || formData.password.length < 6)
    ) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Check if user is trying to change their own role
    if (
      currentUser &&
      currentUser.id === user.id &&
      formData.roleName !== originalRole
    ) {
      setError("You cannot change your own role");
      return false;
    }

    // Check admin role change (will be double-checked by backend)
    if (originalRole === "ROLE_ADMIN" && formData.roleName !== "ROLE_ADMIN") {
      // Show warning but still allow submission - backend will validate
      console.warn(
        "Changing admin role - backend will validate if this is allowed"
      );
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Only include password if it's being changed
      const dataToSubmit = { ...formData };
      if (!changePassword) {
        delete dataToSubmit.password;
      }

      await userService.updateUser(user.id, dataToSubmit);
      onUserUpdated();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update user. Please try again."
      );
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const isOwnUser = currentUser && currentUser.id === user?.id;
  const isChangingFromAdmin =
    originalRole === "ROLE_ADMIN" && formData.roleName !== "ROLE_ADMIN";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isChangingFromAdmin && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Changing an admin user to another role may be restricted if this is
            the last admin user.
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
            <FormControlLabel
              control={
                <Switch
                  checked={changePassword}
                  onChange={handlePasswordToggle}
                  color="primary"
                />
              }
              label="Change Password"
            />
          </Grid>
          {changePassword && (
            <Grid item xs={12}>
              <TextField
                name="password"
                label="New Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required={changePassword}
                helperText="Password must be at least 6 characters long"
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Tooltip
              title={isOwnUser ? "You cannot change your own role" : ""}
              placement="top"
            >
              <div style={{ width: "100%" }}>
                {" "}
                {/* Wrapper div for Tooltip to work with disabled FormControl */}
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="roleName"
                    value={formData.roleName}
                    onChange={handleChange}
                    label="Role"
                    disabled={isOwnUser} // Disable role change for own user
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </Tooltip>
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
          {loading ? "Updating..." : "Update User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
