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
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogin = () => {
    navigate("/login");
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
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            maxWidth: 500,
            width: "100%",
          }}
        >
          <SecurityIcon sx={{ fontSize: 120, mb: 2, opacity: 0.8 }} />

          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            403
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom>
            Access Denied
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            You don't have permission to access this resource. Please contact
            your administrator if you believe this is an error.
          </Typography>

          <Alert
            severity="warning"
            sx={{ mb: 4, backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Typography variant="body2">
              <strong>Possible reasons:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, textAlign: "left" }}>
              <Box component="li">
                <Typography variant="body2">
                  You need to be logged in
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Your account doesn't have the required permissions
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Your session may have expired
                </Typography>
              </Box>
            </Box>
          </Alert>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<LockIcon />}
              onClick={handleLogin}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                },
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              Login
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
            If you believe this is an error, please contact your administrator.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
