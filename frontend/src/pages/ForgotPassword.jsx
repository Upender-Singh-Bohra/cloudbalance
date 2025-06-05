import { useState } from "react";
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
} from "@mui/material";
import { forgotPassword } from "../services/authService";
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await forgotPassword(email);

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      setError("Failed to process request. Please try again later.", error);
    } finally {
      setIsLoading(false);
    }
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
            Forgot Password 😯
          </Typography>

          {success ? (
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                If your email is registered with us, you will receive a password
                reset link shortly.
              </Alert>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                <strong>Back to Login</strong>
              </Button>
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Typography sx={{ mb: 2 }}>
                Enter your email address and we'll send you a link to reset your
                password.
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%" }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleInputChange}
                  disabled={isLoading}
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
                    "Send Reset Link"
                  )}
                </Button>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Link component={RouterLink} to="/login" variant="body2">
                    <strong>Back to Login</strong>
                  </Link>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ForgotPassword;
