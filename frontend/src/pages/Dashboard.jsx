import { Box, Typography, Grid, Paper, Stack } from "@mui/material";
import { useSelector } from "react-redux";
import {
  PeopleAlt as PeopleIcon,
  CloudUpload as CloudUploadIcon,
  BarChart as BarChartIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const cards = [
    {
      title: "User Management",
      description: "Manage users and their roles",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: "/users",
      color: "#3f51b5",
      roles: ["ROLE_ADMIN", "ROLE_READ_ONLY"],
    },
    {
      title: "Onboarding",
      description: "Onboard new cloud accounts",
      icon: <CloudUploadIcon sx={{ fontSize: 40 }} />,
      path: "/onboarding",
      color: "#f44336",
      roles: ["ROLE_ADMIN"],
    },
    {
      title: "Cost Explorer",
      description: "Analyze and monitor cloud costs",
      icon: <BarChartIcon sx={{ fontSize: 40 }} />,
      path: "/cost-explorer",
      color: "#4caf50",
      roles: ["ROLE_ADMIN", "ROLE_READ_ONLY", "ROLE_CUSTOMER"],
    },
    {
      title: "AWS Services",
      description: "View and manage AWS services",
      icon: <StorageIcon sx={{ fontSize: 40 }} />,
      path: "/aws-services",
      color: "#ff9800",
      roles: ["ROLE_ADMIN", "ROLE_READ_ONLY", "ROLE_CUSTOMER"],
    },
  ];

  // Filter cards based on user role
  const filteredCards = cards.filter(
    (card) => !card.roles || card.roles.includes(user?.role)
  );

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to CloudBalance
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 4 }}>
        Select a dashboard to get started
      </Typography>

      <Grid container spacing={3}>
        {filteredCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                height: 200,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
                position: "relative",
                overflow: "hidden",
              }}
              elevation={2}
              onClick={() => handleCardClick(card.path)}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "5px",
                  bgcolor: card.color,
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                  color: card.color,
                }}
              >
                {card.icon}
              </Box>

              <Typography
                variant="h6"
                component="h2"
                align="center"
                gutterBottom
              >
                {card.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" align="center">
                {card.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
