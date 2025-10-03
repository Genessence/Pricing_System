import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Alert,
} from "@mui/material";
import {
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Support as SupportIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface ServerErrorProps {
  errorCode?: number;
  errorMessage?: string;
  onRetry?: () => void;
}

export const ServerError: React.FC<ServerErrorProps> = ({
  errorCode = 500,
  errorMessage,
  onRetry,
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const getErrorInfo = (code: number) => {
    switch (code) {
      case 500:
        return {
          title: "Internal Server Error",
          description:
            "Something went wrong on our end. We're working to fix it.",
        };
      case 502:
        return {
          title: "Bad Gateway",
          description:
            "The server received an invalid response from another server.",
        };
      case 503:
        return {
          title: "Service Unavailable",
          description:
            "The service is temporarily unavailable. Please try again later.",
        };
      case 504:
        return {
          title: "Gateway Timeout",
          description: "The server took too long to respond.",
        };
      default:
        return {
          title: "Server Error",
          description: "An unexpected error occurred. Please try again.",
        };
    }
  };

  const errorInfo = getErrorInfo(errorCode);

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        textAlign="center"
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 3,
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
            color: "white",
            maxWidth: 600,
            width: "100%",
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            {errorCode}
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom>
            {errorInfo.title}
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            {errorMessage || errorInfo.description}
          </Typography>

          <Alert
            severity="warning"
            sx={{ mb: 4, backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Typography variant="body2">
              <strong>What you can do:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, textAlign: "left" }}>
              <Box component="li">
                <Typography variant="body2">
                  Wait a few minutes and try again
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Check your internet connection
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Contact support if the problem persists
                </Typography>
              </Box>
            </Box>
          </Alert>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                },
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              Try Again
            </Button>

            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                borderColor: "rgba(255,255,255,0.5)",
                color: "white",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.7)",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Go Home
            </Button>
          </Box>
        </Paper>

        <Box mt={4} display="flex" alignItems="center" gap={1}>
          <SupportIcon color="action" />
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our support team
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
