import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleGoBack = () => {
    navigate(-1);
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            maxWidth: 500,
            width: "100%",
          }}
        >
          <SearchIcon sx={{ fontSize: 120, mb: 2, opacity: 0.8 }} />

          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            404
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom>
            Page Not Found
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                },
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              Go Home
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{
                borderColor: "rgba(255,255,255,0.5)",
                color: "white",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.7)",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Go Back
            </Button>
          </Box>
        </Paper>

        <Box mt={4}>
          <Typography variant="body2" color="text.secondary">
            If you believe this is an error, please contact support.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
