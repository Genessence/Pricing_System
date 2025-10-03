import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ProtectedRoute } from "./components/common";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import {
  Login,
  Dashboard,
  Unauthorized,
  NotFound,
  ServerError,
  Maintenance,
  Demo,
} from "./pages";
import { UserRole } from "./types";

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#667eea",
    },
    secondary: {
      main: "#764ba2",
    },
    background: {
      default: "#f5f7fa",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/not-found" element={<NotFound />} />
                <Route path="/server-error" element={<ServerError />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/demo" element={<Demo />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute
                      requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}
                    >
                      <div style={{ padding: "2rem" }}>
                        <h1>Admin Panel</h1>
                        <p>Admin-only content goes here</p>
                      </div>
                    </ProtectedRoute>
                  }
                />

                {/* Super Admin Routes */}
                <Route
                  path="/super-admin/*"
                  element={
                    <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
                      <div style={{ padding: "2rem" }}>
                        <h1>Super Admin Panel</h1>
                        <p>Super admin-only content goes here</p>
                      </div>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />

                {/* Catch all route - 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
