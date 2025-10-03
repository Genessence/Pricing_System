import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Build as BuildIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

interface MaintenanceProps {
  estimatedTime?: string;
  message?: string;
}

export const Maintenance: React.FC<MaintenanceProps> = ({
  estimatedTime = "30 minutes",
  message,
}) => {
  const handleRefresh = () => {
    window.location.reload();
  };

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
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
            maxWidth: 600,
            width: "100%",
          }}
        >
          <BuildIcon sx={{ fontSize: 120, mb: 2, opacity: 0.8 }} />

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            System Maintenance
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            We're currently performing scheduled maintenance
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            {message ||
              "Our team is working hard to improve your experience. We'll be back online shortly."}
          </Typography>

          <Alert
            severity="info"
            sx={{ mb: 4, backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <InfoIcon />
              <Typography variant="body2">
                <strong>Estimated completion time:</strong> {estimatedTime}
              </Typography>
            </Box>
          </Alert>

          <Box sx={{ width: "100%", mb: 4 }}>
            <LinearProgress
              variant="indeterminate"
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "rgba(255,255,255,0.8)",
                },
              }}
            />
          </Box>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                },
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              Check Again
            </Button>
          </Box>
        </Paper>

        <Box mt={4}>
          <Typography variant="body2" color="text.secondary">
            Thank you for your patience during this maintenance window.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
