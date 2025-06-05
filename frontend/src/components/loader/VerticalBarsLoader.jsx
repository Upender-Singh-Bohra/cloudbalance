import React from "react";
import { Box, Typography } from "@mui/material";

const VerticalBarsLoader = ({
  isLoading,
  text = "Loading...",
  barColors = ["#4398D7", "#D64794", "#253E66"],

}) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          mb: 3,
        }}
      >
        {/* First Bar */}
        <Box
          sx={{
            width: 8,
            height: 50,
            backgroundColor: barColors[0],
            borderRadius: 0,
            animation: "bar1 1.5s ease-in-out infinite",
            "@keyframes bar1": {
              "0%, 100%": { transform: "scaleY(0.5)" },
              "50%": { transform: "scaleY(1)" },
            },
          }}
        />  
        {/* Second Bar */}
        <Box
          sx={{
            width: 8,
            height: 50,
            backgroundColor: barColors[1],
            borderRadius: 0,
            animation: "bar2 1.5s ease-in-out infinite",
            animationDelay: "0.2s",
            "@keyframes bar2": {
              "0%, 100%": { transform: "scaleY(0.5)" },
              "50%": { transform: "scaleY(1)" },
            },
          }}
        />
        {/* Third Bar */}
        <Box
          sx={{
            width: 8,
            height: 50,
            backgroundColor: barColors[2],
            borderRadius: 0,
            animation: "bar3 1.5s ease-in-out infinite",
            animationDelay: "0.4s",
            "@keyframes bar3": {
              "0%, 100%": { transform: "scaleY(0.5)" },
              "50%": { transform: "scaleY(1)" },
            },
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: "#666",
          fontWeight: 500,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default VerticalBarsLoader;
