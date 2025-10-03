import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import { useNotification } from "../hooks/useNotification";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { ViteModesDemo } from "../components/demo";

export const Demo: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const {
    handleError,
    handleServerError,
    handleWarning,
    handleInfo,
    ErrorDialogComponent,
    ServerErrorPopupComponent,
  } = useErrorHandler();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNotificationDemo = (
    type: "success" | "error" | "warning" | "info"
  ) => {
    switch (type) {
      case "success":
        showSuccess("Operation completed successfully!");
        break;
      case "error":
        showError("Something went wrong. Please try again.");
        break;
      case "warning":
        showWarning("Please check your input before proceeding.");
        break;
      case "info":
        showInfo("Here's some helpful information for you.");
        break;
    }
  };

  const handleErrorDialogDemo = () => {
    handleError(new Error("This is a demo error with detailed information"), {
      showDialog: true,
    });
  };

  const handleServerErrorDemo = () => {
    handleServerError(
      500,
      "Internal Server Error",
      "The server encountered an unexpected condition that prevented it from fulfilling the request."
    );
  };

  const handleWarningDialogDemo = () => {
    handleWarning("This is a warning message with dialog", {
      showDialog: true,
    });
  };

  const handleInfoDialogDemo = () => {
    handleInfo("This is an informational message with dialog", {
      showDialog: true,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Demo & Testing Center
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        This page demonstrates the various features and components available in
        the application.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Error Handling" />
          <Tab label="Vite Modes" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Notifications */}
          <Container sx={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SuccessIcon
                    color="success"
                    sx={{ mr: 1, verticalAlign: "middle" }}
                  />
                  Notifications (Snackbar)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Quick notifications that appear in the top-right corner for
                  user feedback.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleNotificationDemo("success")}
                  >
                    Success
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleNotificationDemo("error")}
                  >
                    Error
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => handleNotificationDemo("warning")}
                  >
                    Warning
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={() => handleNotificationDemo("info")}
                  >
                    Info
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Container>

          {/* Error Dialogs */}
          <Container sx={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <ErrorIcon
                    color="error"
                    sx={{ mr: 1, verticalAlign: "middle" }}
                  />
                  Error Dialogs
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Modal dialogs for important errors that require user
                  attention.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleErrorDialogDemo}
                  >
                    Error Dialog
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={handleWarningDialogDemo}
                  >
                    Warning Dialog
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={handleInfoDialogDemo}
                  >
                    Info Dialog
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Container>

          {/* Server Error Popup */}
          <Container sx={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <WarningIcon
                    color="warning"
                    sx={{ mr: 1, verticalAlign: "middle" }}
                  />
                  Server Error Popup
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Specialized popup for server errors with retry options and
                  technical details.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleServerErrorDemo}
                  >
                    Server Error (500)
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={() =>
                      handleServerError(503, "Service Unavailable")
                    }
                  >
                    Service Unavailable (503)
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={() => handleServerError(404, "Not Found")}
                  >
                    Not Found (404)
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Container>

          {/* Error Pages */}
          <Container sx={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <InfoIcon
                    color="info"
                    sx={{ mr: 1, verticalAlign: "middle" }}
                  />
                  Error Pages
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Full-page error displays for major issues.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => (window.location.href = "/not-found")}
                  >
                    404 Page
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => (window.location.href = "/server-error")}
                  >
                    500 Page
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => (window.location.href = "/unauthorized")}
                  >
                    403 Page
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => (window.location.href = "/maintenance")}
                  >
                    Maintenance
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>
      )}

      {tabValue === 1 && <ViteModesDemo />}

      {/* Render Error Components */}
      {ErrorDialogComponent}
      {ServerErrorPopupComponent}
    </Container>
  );
};
