import { useRef } from "react";
import { Box, IconButton, Tooltip, Paper } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";
import { useState } from "react";

const CodeBlock = ({ code, language = "javascript" }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        borderRadius: 1,
        mb: 2,
        overflow: "hidden",
        bgcolor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          bgcolor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "50%",
        }}
      >
        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? (
              <DoneIcon fontSize="small" color="success" />
            ) : (
              <ContentCopyIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        ref={codeRef}
        component="pre"
        sx={{
          p: 2,
          m: 0,
          overflowX: "auto",
          fontSize: "0.875rem",
          fontFamily:
            'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
        }}
      >
        <Box
          component="code"
          sx={{
            whiteSpace: "pre",
            display: "block",
          }}
        >
          {code}
        </Box>
      </Box>
    </Paper>
  );
};

export default CodeBlock;
