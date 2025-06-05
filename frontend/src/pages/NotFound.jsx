// import { Box, Typography, Button } from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import { logout } from '../store/slices/authSlice';

// const Dashboard = () => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);

//   const handleLogout = () => {
//     dispatch(logout());
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" sx={{ mb: 2 }}>
//         Dashboard
//       </Typography>
//       <Typography variant="body1" sx={{ mb: 3 }}>
//         Welcome, {user?.firstName} {user?.lastName}! You are logged in as {user?.role}.
//       </Typography>
//       <Button variant="contained" color="primary" onClick={handleLogout}>
//         Logout
//       </Button>
//     </Box>
//   );
// };

// export default Dashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, Grid } from "@mui/material";

const NotFound = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded state after component mount to ensure animation works properly
    setIsLoaded(true);
  }, []);

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 0",
        background: "#fff",
        fontFamily: "'Arvo', serif",
      }}
    >
      <Container maxWidth="md">
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} sx={{ textAlign: "center" }}>
            <Box
              sx={{
                height: "400px",
                backgroundImage:
                  "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: "80px",
                  fontWeight: "bold",
                  margin: -5,
                  // fontFamily: "'Arvo', serif",
                }}
              >
                4 0 4
              </Typography>
            </Box>

            <Box sx={{ marginTop: "-50px" }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  // fontFamily: "'Arvo', serif",
                  marginBottom: 2,
                }}
              >
                Looks like you're lost
              </Typography>

              <Typography
                variant="body1"
                sx={{ marginBottom: 3 }}
              >
                The page you are looking for is not available!
              </Typography>

              <Button
                variant="contained"
                onClick={handleGoHome}
                sx={{
                  color: "#fff",
                  padding: "10px 20px",
                  marginTop: 2,
                  marginBottom: 2,
                  display: "inline-block",
                  textDecoration: "none",
                  borderRadius: "5px",
                  transition: "all 0.3s ease",
                  // fontFamily: "'Arvo', serif",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#2d8a27",
                  },
                }}
              >
                <strong>Go to Home</strong>
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default NotFound;
