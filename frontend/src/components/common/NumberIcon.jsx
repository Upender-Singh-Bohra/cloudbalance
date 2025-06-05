import React from "react";
import { Avatar } from "@mui/material";

/**
 * A component that renders numbered icons for ordered lists
 * Uses a custom Avatar with number text for any number
 */
const NumberIcon = ({ number, color = "primary", size = "medium" }) => {
  // Calculate size based on the size prop
  const avatarSize = size === "small" ? 24 : 32;
  const fontSize = size === "small" ? 14 : 16;
  
  // Determine background color
  const bgColor = 
    color === "primary" ? "primary.main" : 
    color === "secondary" ? "secondary.main" :
    `${color}.main`;

  return (
    <Avatar
      sx={{
        width: avatarSize,
        height: avatarSize,
        bgcolor: bgColor,
        color: "white",
        fontSize: fontSize,
        fontWeight: "bold",
      }}
    >
      {number}
    </Avatar>
  );
};

export default NumberIcon;