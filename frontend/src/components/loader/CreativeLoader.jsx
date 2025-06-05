import React from "react";
import { Box, Typography } from "@mui/material";

const CreativeLoader = ({ isLoading, text = "Loading..." }) => {
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
          position: "relative",
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #3f51b5",
            animation: "spin 1.5s linear infinite",
            position: "relative",
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid #f3f3f3",
            borderBottom: "3px solid #f50057",
            animation: "spin 1.2s linear infinite",
            position: "absolute",
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: "#666",
          fontWeight: 500,
          position: "relative",
          "&::after": {
            content: '""',
            animation: "ellipsis-animation 1.5s infinite",
            "@keyframes ellipsis-animation": {
              "0%": { content: '"."' },
              "33%": { content: '".."' },
              "66%": { content: '"..."' },
              "100%": { content: '"."' },
            },
          },
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default CreativeLoader;
