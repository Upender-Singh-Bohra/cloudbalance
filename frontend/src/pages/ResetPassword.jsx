import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { validateResetToken, resetPassword } from "../services/authService";
import { Link as RouterLink } from "react-router-dom";

const Logo = ({ size = 24, sx = {} }) => (
  <Box
    component="img"
    src="/cloudbalance_logo_final.png"
    sx={{
      width: size,
      height: size,
      objectFit: "contain",
      ...sx,
    }}
  />
);

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Validate token when component mounts
    if (token) {
      validateToken();
    } else {
      setIsTokenValid(false);
      setIsValidating(false);
      setError("No reset token provided");
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setIsValidating(true);
      const response = await validateResetToken(token);
      setIsTokenValid(response.success);

      if (!response.success) {
        setError(response.message || "Invalid or expired token");
      }
    } catch (error) {
      setIsTokenValid(false);
      setError("Failed to validate token");
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const response = await resetPassword(token, formData.newPassword);

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isValidating) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!isTokenValid) {
      return (
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "Invalid or expired password reset link"}
          </Alert>
          <Typography sx={{ mb: 2 }}>
            The password reset link is invalid or has expired. Please request a
            new link.
          </Typography>
          <Button
            component={RouterLink}
            to="/forgot-password"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Request New Link
          </Button>
        </Box>
      );
    }

    if (success) {
      return (
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Your password has been successfully reset
          </Alert>
          <Typography sx={{ mb: 2 }}>
            You can now log in with your new password.
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Box>
      );
    }

    return (
      <>
        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography sx={{ mb: 2 }}>
          Enter a new password for your account.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type={showPassword ? "text" : "password"}
            id="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: "100vh", backgroundColor: "#F7F7F7" }}
    >
      <Grid item xs={12} sm={8} md={5} lg={4}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
            <Logo size={60} sx={{ mr: 0 }} />
            <Typography component="h1" variant="h4" color="#253E66">
              CloudBalance
            </Typography>
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Reset Password
          </Typography>

          {renderContent()}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ResetPassword;
