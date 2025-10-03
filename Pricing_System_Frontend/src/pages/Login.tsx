import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import type { LoginCredentials } from "../types/login";
import { LoadingSpinner } from "../components/common";

export const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { authState, login } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  if (authState.isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 3,
            width: "100%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
          >
            <LoginIcon sx={{ fontSize: 40, mr: 1 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Pricing System
            </Typography>
          </Box>

          <Typography component="h2" variant="h5" gutterBottom>
            Sign In
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ mb: 3, opacity: 0.9 }}
          >
            Enter your credentials to access the dashboard
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleInputChange}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: 2,
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(0,0,0,0.7)",
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleInputChange}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={togglePasswordVisibility}
                      endIcon={
                        showPassword ? <VisibilityOff /> : <Visibility />
                      }
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: 2,
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(0,0,0,0.7)",
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                },
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 2,
              }}
            >
              {isLoading ? <LoadingSpinner size={24} message="" /> : "Sign In"}
            </Button>
          </Box>
        </Paper>

        {/* Demo Credentials Card */}
        <Card
          sx={{
            mt: 3,
            width: "100%",
            maxWidth: 400,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Demo Credentials
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight="bold" color="error">
                  Super Admin:
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  admin@example.com / password123
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="warning.main"
                >
                  Admin:
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  manager@example.com / password123
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" fontWeight="bold" color="info.main">
                  User:
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  user@example.com / password123
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
